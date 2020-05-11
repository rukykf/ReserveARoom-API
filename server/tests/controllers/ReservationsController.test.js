const db = require("../../../server/src/data-access/db-config")
const { DateTime } = require("luxon")
const Reservation = require("../../src/data-access/models/Reservation")
const OTP = require("../../src/data-access/models/OTP")
const Room = require("../../src/data-access/models/Room")
const _ = require("lodash")
const ReservationsController = require("../../src/controllers/ReservationsController")

beforeAll(async () => {
  await db.migrate.latest()
})

jest.mock("../../src/libraries/SMSMessage", () => {
  return jest.fn()
})
const sendMessage = require("../../src/libraries/SMSMessage")

let reservations = []
let otps = []
let room

beforeAll(async () => {
  await Room.query().delete()
  room = await Room.query().insert({
    room_no: 301,
    room_type_id: 2,
  })
})

beforeEach(async () => {
  await Reservation.query().delete()
  await OTP.query().delete()
  reservations = []
  otps = []
})

afterAll(async () => {
  await Reservation.query().delete()
  await OTP.query().delete()
  await Room.query().delete()
})

async function populateReservations() {
  let reservation = await Reservation.query().insert({
    room_id: room.id,
    start_date: DateTime.local().plus({ days: 7 }).toISODate(),
    end_date: DateTime.local().plus({ days: 12 }).toISODate(),
    start_datetime: DateTime.local().plus({ days: 7 }).toISO(),
    end_datetime: DateTime.local().plus({ days: 12 }).toISO(),
    created_at: DateTime.local().minus({ days: 4 }).toISODate(),
    guest_name: "some guest",
    guest_phone_number: "+0000000000",
    status: "open",
  })

  let otp = await OTP.query().insert({
    reservation_id: reservation.id,
    otp_code: "324234234",
  })

  reservations.push(reservation)
  otps.push(otp)
}

test("ReservationsController.getAllReservations returns list of all available reservations", async () => {
  await populateReservations()
  let res = { json: jest.fn() }
  let req = {}
  await ReservationsController.getAllReservations(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining(reservations[0])]))
})

test("ReservationsController.getAllReservations filters list of reservations by status", async () => {
  await populateReservations()
  let res = { json: jest.fn() }
  let req = { query: { status: "pending-confirmation" } }
  await ReservationsController.getAllReservations(req, res)
  expect(res.json).toHaveBeenCalledWith([])
})

test("ReservationsController.getAllReservations filters list of reservations by date", async () => {
  await populateReservations()
  let res = { json: jest.fn() }
  let date = DateTime.local().minus({ days: 3 }).toISODate()

  let req = { query: { start_date: date } }
  await ReservationsController.getAllReservations(req, res)
  expect(res.json).toHaveBeenLastCalledWith([])

  req = { query: { end_date: date } }
  await ReservationsController.getAllReservations(req, res)
  expect(res.json).toHaveBeenLastCalledWith(expect.arrayContaining([expect.objectContaining(reservations[0])]))
})

test("ReservationsController.createReservationsForRoom returns success message when reservation is successfully created", async () => {
  let res = { json: jest.fn() }
  let req = {
    params: { id: room.id },
    body: {
      start_datetime: DateTime.local().plus({ days: 5 }).toISO(),
      end_datetime: DateTime.local().plus({ days: 9 }).toISO(),
      guest_name: "some guest",
      guest_phone_number: "+2348169312496",
    },
  }
  await ReservationsController.createReservationForRoom(req, res)
  expect(res.json).toHaveBeenLastCalledWith({
    message: "successfully created reservation",
    reservation_id: expect.anything(),
  })
  expect(sendMessage).toHaveBeenCalledTimes(1)
})

test("ReservationsController.createReservationForRoom returns error message with invalid dates", async () => {
  let res = { status: jest.fn(), json: jest.fn() }
  res.status.mockReturnThis()
  let req = {
    params: { id: 3 },
    body: {
      start_datetime: DateTime.local().minus({ days: 1 }).toISO(),
      end_datetime: DateTime.local().plus({ days: 5 }).toISO(),
      guest_name: "Guest",
      guest_phone_number: "+12345678900",
    },
  }
  await ReservationsController.createReservationForRoom(req, res)
  expect(res.status).toHaveBeenLastCalledWith(400)
  expect(res.json).toHaveBeenLastCalledWith({ message: "the dates for this reservation are invalid" })

  req.body.start_datetime = DateTime.local().plus({ days: 5 }).toISO()
  req.body.end_datetime = DateTime.local().plus({ days: 2 }).toISO()
  await ReservationsController.createReservationForRoom(req, res)
  expect(res.status).toHaveBeenLastCalledWith(400)
  expect(res.json).toHaveBeenLastCalledWith({ message: "the dates for this reservation are invalid" })

  req.body.start_datetime = "some invalid date string"
  req.body.end_datetime = DateTime.local().plus({ days: 2 }).toISO()
  await ReservationsController.createReservationForRoom(req, res)
  expect(res.status).toHaveBeenLastCalledWith(400)
  expect(res.json).toHaveBeenLastCalledWith({ message: "the dates for this reservation are invalid" })
})

test("ReservationsController.createReservationForRoom returns error message with invalid phone number format", async () => {
  let res = { status: jest.fn(), json: jest.fn() }
  res.status.mockReturnThis()
  let req = {
    params: { id: 3 },
    body: {
      start_datetime: DateTime.local().plus({ days: 7 }).toISO(),
      end_datetime: DateTime.local().plus({ days: 10 }).toISO(),
      guest_name: "Guest",
      guest_phone_number: "8923323",
    },
  }
  await ReservationsController.createReservationForRoom(req, res)
  expect(res.status).toHaveBeenLastCalledWith(400)
  expect(res.json).toHaveBeenLastCalledWith({ message: "the phone number for this reservation is invalid" })
})

test("ReservationsController.createReservationsForRoom returns error message with invalid guest name", async () => {
  let res = { status: jest.fn(), json: jest.fn() }
  res.status.mockReturnThis()
  let req = {
    params: { id: 3 },
    body: {
      start_datetime: DateTime.local().plus({ days: 7 }).toISO(),
      end_datetime: DateTime.local().plus({ days: 10 }).toISO(),
      guest_phone_number: "+12345678900",
    },
  }
  await ReservationsController.createReservationForRoom(req, res)
  expect(res.status).toHaveBeenLastCalledWith(400)
  expect(res.json).toHaveBeenLastCalledWith({ message: "guest name is required to reserve a room" })
})

test("ReservationsController.createReservationsForRoom returns error message when reservation date conflicts with an open reservation", async () => {
  let reservation = await Reservation.query().insert({
    room_id: room.id,
    start_date: DateTime.local().plus({ days: 7 }).toISODate(),
    end_date: DateTime.local().plus({ days: 12 }).toISODate(),
    start_datetime: DateTime.local().plus({ days: 7 }).toISO(),
    end_datetime: DateTime.local().plus({ days: 12 }).toISO(),
    created_at: DateTime.local().minus({ days: 4 }).toISODate(),
    guest_name: "some guest",
    guest_phone_number: "+0000000000",
    status: "open",
  })

  let res = { status: jest.fn(), json: jest.fn() }
  res.status.mockReturnThis()
  let req = {
    params: { id: room.id },
    body: {
      start_datetime: DateTime.local().plus({ days: 9 }).toISO(),
      end_datetime: DateTime.local().plus({ days: 20 }).toISO(),
      guest_name: "some guest",
      guest_phone_number: "+0000000000",
    },
  }
  await ReservationsController.createReservationForRoom(req, res)
  expect(res.json).toHaveBeenLastCalledWith({ message: "this room already has a reservation for the selected dates, cancel those reservations first" })
  expect(res.status).toHaveBeenLastCalledWith(400)

  req.body.start_datetime = DateTime.local().plus({ days: 4 }).toISO()
  req.body.end_datetime = DateTime.local().plus({ days: 9 }).toISO()
  await ReservationsController.createReservationForRoom(req, res)
  expect(res.json).toHaveBeenLastCalledWith({ message: "this room already has a reservation for the selected dates, cancel those reservations first" })
  expect(res.status).toHaveBeenLastCalledWith(400)
})

test("ReservationsController.resendOtpForReservation returns success message when passed valid data", async () => {
  await populateReservations()
  let res = { json: jest.fn() }
  let req = {
    params: { id: reservations[0].id },
  }
  await ReservationsController.resendOtpForReservation(req, res)
  expect(res.json).toHaveBeenCalledWith({ message: "otp resent successfully" })
})

test("ReservationsController.resendOtpForReservation returns error message when passed invalid phone number", async () => {
  await populateReservations()
  let res = { status: jest.fn(), json: jest.fn() }
  res.status.mockReturnThis()
  let req = {
    params: { id: reservations[0].id },
    body: { guest_phone_number: "234559898" },
  }
  await ReservationsController.resendOtpForReservation(req, res)
  expect(res.json).toHaveBeenCalledWith({ message: "the phone number for this reservation is invalid" })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("ReservationsController.resendOtpForReservation returns error message when passed invalid reservation id", async () => {
  let res = { status: jest.fn(), json: jest.fn() }
  res.status.mockReturnThis()
  let req = {
    params: { id: 20 },
  }
  await ReservationsController.resendOtpForReservation(req, res)
  expect(res.json).toHaveBeenCalledWith({ message: "could not find reservation" })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("ReservationsController.confirmReservation returns success message when passed valid otp for confirmation", async () => {
  let reservation = await Reservation.query().insert({
    room_id: room.id,
    start_date: DateTime.local().plus({ days: 7 }).toISODate(),
    end_date: DateTime.local().plus({ days: 12 }).toISODate(),
    start_datetime: DateTime.local().plus({ days: 7 }).toISO(),
    end_datetime: DateTime.local().plus({ days: 12 }).toISO(),
    created_at: DateTime.local().minus({ days: 4 }).toISODate(),
    guest_name: "some guest",
    guest_phone_number: "+0000000000",
    status: "pending-confirmation",
  })

  let otp = await OTP.query().insert({
    created_at: DateTime.local().toISO(),
    reservation_id: reservation.id,
    otp_code: "324234234",
  })

  let res = { json: jest.fn() }
  let req = {
    params: { id: reservation.id },
    body: { otp: "324234234" },
  }
  await ReservationsController.confirmReservation(req, res)
  expect(res.json).toHaveBeenCalledWith({ message: "successfully confirmed reservation" })
})

test("ReservationsController.confirmReservation returns error message when passed invalid otp for confirmation", async () => {
  let reservation = await Reservation.query().insert({
    room_id: room.id,
    start_date: DateTime.local().plus({ days: 7 }).toISODate(),
    end_date: DateTime.local().plus({ days: 12 }).toISODate(),
    start_datetime: DateTime.local().plus({ days: 7 }).toISO(),
    end_datetime: DateTime.local().plus({ days: 12 }).toISO(),
    created_at: DateTime.local().minus({ minutes: 40 }).toISODate(),
    guest_name: "some guest",
    guest_phone_number: "+0000000000",
    status: "open",
  })

  let otp = await OTP.query().insert({
    created_at: DateTime.local().minus({ minutes: 40 }).toISO(),
    reservation_id: reservation.id,
    otp_code: "324234234",
  })

  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  let req = {
    params: { id: reservation.id },
    body: { otp: "324234234" },
  }
  await ReservationsController.confirmReservation(req, res)
  expect(res.json).toHaveBeenCalledWith({ message: "could not confirm reservation with invalid otp" })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("ReservationsController.confirmReservation returns error message when passed invalid reservation id", async () => {
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  let req = {
    params: { id: 58 },
    body: { otp: "324234234" },
  }
  await ReservationsController.confirmReservation(req, res)
  expect(res.json).toHaveBeenCalledWith({ message: "could not find the selected reservation" })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("ReservationsController.getReservationsCalendarForRoom returns calendar for room when passed valid data", async () => {
  await populateReservations()
  let req = { params: { id: room.id } }
  let res = { json: jest.fn() }
  await ReservationsController.getReservationsCalendarForRoom(req, res)
  expect(res.json).toHaveBeenCalledWith([
    { start_datetime: reservations[0].start_datetime, end_datetime: reservations[0].end_datetime },
  ])
})

test("ReservationsController.getReservationsExpiringToday returns reservations starting today", async () => {
  await populateReservations()
  let reservation = await Reservation.query().insert({
    room_id: room.id,
    start_date: DateTime.local().toISODate(),
    end_date: DateTime.local().plus({ days: 12 }).toISODate(),
    start_datetime: DateTime.local().toISO(),
    end_datetime: DateTime.local().plus({ days: 12 }).toISO(),
    created_at: DateTime.local().minus({ days: 4 }).toISODate(),
    guest_name: "some guest",
    guest_phone_number: "+0000000000",
    status: "open",
  })
  let req = {}
  let res = { json: jest.fn() }
  await ReservationsController.getReservationsExpiringToday(req, res)
  expect(res.json).toHaveBeenCalledWith([expect.objectContaining(reservation)])
})

test("ReservationsController.updateReservationStatus returns reservation after successful status update", async () => {
  await populateReservations()
  reservations[0].status = "closed"
  let req = {
    params: { id: reservations[0].id },
    body: { status: "closed" },
  }
  let res = { json: jest.fn() }
  await ReservationsController.updateReservationStatus(req, res)
  expect(res.json).toHaveBeenCalledWith(reservations[0])
})

test("ReservationsController.updateReservationStatus returns error message when passed invalid status", async () => {
  await populateReservations()
  reservations[0].status = "closed"
  let req = {
    params: { id: reservations[0].id },
    body: { status: "an-invalid-status" },
  }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()

  await ReservationsController.updateReservationStatus(req, res)
  expect(res.json).toHaveBeenCalledWith({ message: "invalid reservation status" })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("ReservationsController.updateReservationStatus returns error message when passed invalid reservation id", async () => {
  let req = {
    params: { id: 99 },
    body: { status: "closed" },
  }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()

  await ReservationsController.updateReservationStatus(req, res)
  expect(res.json).toHaveBeenCalledWith({ message: "invalid reservation id" })
  expect(res.status).toHaveBeenCalledWith(400)
})
