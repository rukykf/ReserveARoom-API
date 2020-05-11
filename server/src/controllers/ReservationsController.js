const { DateTime, Interval } = require("luxon")
const { ValidationError, NotFoundError } = require("objection")
const _ = require("lodash")
const Reservation = require("../data-access/models/Reservation")
const OTP = require("../data-access/models/OTP")
const sendSMSMessage = require("../libraries/SMSMessage")

module.exports = {
  /**
   * Returns a list of all reservations with the rooms that these reservations are associated with
   * List can be filtered by date and status.
   * When filtering by date, returns the reservations that were created in the inclusive range of the start and end dates
   * All dates are converted from the local time of the client to the local time on the server
   *
   * @param req
   * @param res
   */
  async getAllReservations(req, res) {
    try {
      let reservationsQueryBuilder = Reservation.query().withGraphFetched("room")

      if (_.get(req, ["query", "start_date"])) {
        reservationsQueryBuilder.where("created_at", ">=", DateTime.fromISO(req.query.start_date).toLocal().toISODate())
      }

      if (_.get(req, ["query", "end_date"])) {
        reservationsQueryBuilder.where("created_at", "<=", DateTime.fromISO(req.query.end_date).toLocal().toISODate())
      }

      if (_.get(req, ["query", "status"])) {
        reservationsQueryBuilder.where("status", "=", req.query.status)
      }

      let reservations = await reservationsQueryBuilder
      return res.json(reservations)
    } catch (error) {
      return res.status(500).json({ message: "something went wrong, could not retrieve list of reservations" })
    }
  },

  async createReservationForRoom(req, res) {
    try {
      if (!isReservationDateValid(req)) {
        return res.status(400).json({ message: "the dates for this reservation are invalid" })
      }

      if (!isGuestPhoneNumberValid(req)) {
        return res.status(400).json({ message: "the phone number for this reservation is invalid" })
      }

      if (!_.get(req, ["body", "guest_name"])) {
        return res.status(400).json({ message: "guest name is required to reserve a room" })
      }

      let conflictErrorMessage = await checkReservationForConflicts(req)
      if (conflictErrorMessage != null) {
        return res.status(400).json({ message: conflictErrorMessage })
      }

      let reservation = await Reservation.query().insert({
        room_id: _.toNumber(req.params.id),
        start_date: DateTime.fromISO(_.trim(req.body.start_datetime)).toLocal().toISODate(),
        end_date: DateTime.fromISO(_.trim(req.body.end_datetime)).toLocal().toISODate(),
        start_datetime: DateTime.fromISO(_.trim(req.body.start_datetime)).toLocal().toISO(),
        end_datetime: DateTime.fromISO(_.trim(req.body.end_datetime)).toLocal().toISO(),
        guest_name: req.body.guest_name,
        guest_phone_number: req.body.guest_phone_number,
        status: "pending-confirmation",
      })

      let otpCode = generateOTP()
      await sendSMSMessage(`Use this code to confirm your reservation: ${otpCode}`, _.trim(req.body.guest_phone_number))
      let otp = await OTP.query().insert({
        reservation_id: reservation.id,
        otp_code: otpCode,
      })
      res.json({ message: "successfully created reservation", reservation_id: reservation.id })
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ message: "invalid room id" })
      }

      res.status(500).json({ message: "something went wrong, try again later" })
    }
  },

  async resendOtpForReservation(req, res) {
    try {
      // check if a valid phone number is provided and if so, update the phone number for the reservation
      if (_.get(req, ["body", "guest_phone_number"])) {
        if (!isGuestPhoneNumberValid(req.body.guest_phone_number)) {
          return res.status(400).json({ message: "the phone number for this reservation is invalid" })
        }
        await Reservation.query()
          .findById(_.toNumber(req.params.id))
          .patch({ guest_phone_number: req.body.guest_phone_number })
          .throwIfNotFound()
      }

      let reservation = await Reservation.query()
        .findById(_.toNumber(req.params.id))
        .withGraphFetched("otp")
        .throwIfNotFound()
      let otpCode = generateOTP()
      await sendSMSMessage(`Use this code to confirm your reservation ${otpCode}`, reservation.guest_phone_number)
      await OTP.query().findById(reservation.otp.id).patch({ otp_code: otpCode })
      return res.json({ message: "otp resent successfully" })
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ message: "could not find reservation" })
      }

      return res.status(500).json({ message: "something went wrong, try again later" })
    }
  },

  async confirmReservation(req, res) {
    try {
      let otp = await OTP.query().where("reservation_id", "=", _.toNumber(req.params.id)).first().throwIfNotFound()

      // get the number of minutes since the otp was created
      let currentTime = DateTime.local()
      let otpCreationTime = DateTime.fromISO(otp.created_at)
      let duration = Interval.fromDateTimes(otpCreationTime, currentTime).length("minutes")

      if (duration > 20 || _.get(req, ["body", "otp"], 0) !== otp.otp_code) {
        await Reservation.query()
          .findById(_.toNumber(req.params.id))
          .patch({ status: "failed-confirmation" })
          .throwIfNotFound()
        return res.status(400).json({ message: "could not confirm reservation with invalid otp" })
      }

      await Reservation.query().findById(_.toNumber(req.params.id)).patch({ status: "open" })
      res.json({ message: "successfully confirmed reservation" })
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(400).json({ message: "could not find the selected reservation" })
      }

      res.status(500).json({ message: "something went wrong, try again later" })
    }
  },

  /**
   * Returns a calendar containing the start and end dates of all open reservations for a particular room
   *
   * @param req
   * @param res
   */
  async getReservationsCalendarForRoom(req, res) {
    try {
      let reservations = await Reservation.query()
        .where("room_id", "=", _.toNumber(req.params.id))
        .andWhere(function () {
          this.where("status", "=", "open").orWhere("status", "=", "activated")
        })

      let reservationsCalendar = []
      reservations.forEach((reservation) => {
        reservationsCalendar.push({
          start_datetime: reservation.start_datetime,
          end_datetime: reservation.end_datetime,
        })
      })

      return res.json(reservationsCalendar)
    } catch (error) {
      return res.status(500).json({ message: "something went wrong, could not retrieve reservations calendar" })
    }
  },

  /**
   * Returns a list of reservations that are either expiring or expired today
   * @param req
   * @param res
   */
  async getReservationsExpiringToday(req, res) {
    try {
      let reservations = await Reservation.query()
        .where("start_date", "=", DateTime.local().toISODate())
        .andWhere(function () {
          this.where("status", "=", "open").orWhere("status", "=", "expired")
        })
        .withGraphFetched("room")
      return res.json(reservations)
    } catch (error) {
      return res.status(500).json({ message: "something went wrong, could not retrieve list of reservations" })
    }
  },

  async updateReservationStatus(req, res) {
    try {
      let reservation = await Reservation.query()
        .patchAndFetchById(_.toNumber(req.params.id), {
          status: _.get(req, ["body", "status"]),
        })
        .throwIfNotFound()
      return res.json(reservation)
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ message: "invalid reservation status" })
      }
      if (error instanceof NotFoundError) {
        return res.status(400).json({ message: "invalid reservation id" })
      }
      return res.status(500).json({ message: "something went wrong, try again later" })
    }
  },
}

function isReservationDateValid(req) {
  //These dates should be ISO dates with timezones attached e.g 2020-04-28T00:00:00.000+01:00
  let startDate = _.trim(_.get(req, ["body", "start_datetime"]))
  let endDate = _.trim(_.get(req, ["body", "end_datetime"]))

  if (startDate == null || endDate == null) {
    return false
  }

  if (
      DateTime.fromISO(startDate).toLocal().toISODate() == null ||
      DateTime.fromISO(endDate).toLocal().toISODate() == null
  ) {
    return false
  }

  if (DateTime.fromISO(startDate).toLocal().toISODate() <= DateTime.local().toISODate()) {
    return false
  }

  if (endDate < startDate) {
    return false
  }

  return true
}

function isGuestPhoneNumberValid(req) {
  let phoneNumber = _.get(req, ["body", "guest_phone_number"])
  if (phoneNumber == null) {
    return false
  }

  //let re = /^\+{0,2}([\-\. ])?(\(?\d{0,3}\))?([\-\. ])?\(?\d{0,3}\)?([\-\. ])?\d{3}([\-\. ])?\d{4}/
  let re = /^\+(?:[0-9] ?){6,14}[0-9]$/
  return re.test(phoneNumber)
}

function generateOTP() {
  var digits = "0123456789"
  let otp = ""
  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)]
  }
  return otp
}

async function checkReservationForConflicts(req) {
  let startDate = DateTime.fromISO(req.body.start_datetime)
      .toLocal()
      .toISODate()
  let endDate = DateTime.fromISO(req.body.end_datetime)
      .toLocal()
      .toISODate()

  let reservation = await Reservation.query()
      .where((builder) => {
        builder
            .where("start_date", "<=", startDate)
            .andWhere("end_date", ">=", startDate)
            .andWhere("status", "=", "open")
            .andWhere("room_id", "=", _.toNumber(req.params.id))
      })
      .orWhere((builder) => {
        builder
            .where("start_date", "<=", endDate)
            .andWhere("end_date", ">=", endDate)
            .andWhere("status", "=", "open")
            .andWhere("room_id", "=", _.toNumber(req.params.id))
      })
      .orWhere((builder) => {
        builder
            .where("start_date", ">", startDate)
            .andWhere("end_date", "<", endDate)
            .andWhere("status", "=", "open")
            .andWhere("room_id", "=", _.toNumber(req.params.id))
      })
      .orWhere((builder) => {
        builder
            .where("start_date", "<", startDate)
            .andWhere("end_date", ">", endDate)
            .andWhere("status", "=", "open")
            .andWhere("room_id", "=", _.toNumber(req.params.id))
      })
      .first()

  if (reservation != null) {
    return "this room already has a reservation for the selected dates, cancel those reservations first"
  }

  return null
}
