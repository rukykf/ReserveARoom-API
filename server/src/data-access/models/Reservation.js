const Objection = require("../objection-config")
const { DateTime } = require("luxon")

class Reservation extends Objection {
  static get tableName() {
    return "reservations"
  }

  static get relationMappings() {
    const Room = require("./Room")
    const OTP = require("./OTP")

    return {
      room: {
        relation: Objection.BelongsToOneRelation,
        modelClass: Room,
        join: {
          from: "reservations.room_id",
          to: "rooms.id",
        },
      },
      otp: {
        relation: Objection.HasOneRelation,
        modelClass: OTP,
        join: {
          from: "reservations.id",
          to: "otps.reservation_id",
        },
      },
    }
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: [
        "room_id",
        "start_date",
        "end_date",
        "start_datetime",
        "end_datetime",
        "guest_name",
        "guest_phone_number",
        "status",
      ],
      properties: {
        id: { type: "integer" },
        room_id: { type: "integer" },
        end_date: { type: "string", transform: ["trim"] },
        start_date: { type: "string", transform: ["trim"] },
        start_datetime: { type: "string", transform: ["trim"] },
        end_datetime: { type: "string" },
        guest_name: { type: "string", transform: ["trim", "toLowerCase"] },
        guest_phone_number: { type: "string", transform: ["trim"] },
        status: {
          type: "string",
          enum: ["pending-confirmation", "failed-confirmation", "open", "closed", "activated", "expired"],
        },
      },
    }
  }

  $beforeInsert(queryContext) {
    if (this.created_at == null) {
      this.created_at = DateTime.local().toISODate()
    }

    this.updated_at = DateTime.local().toISODate()
  }

  $beforeUpdate(opt, queryContext) {
    this.updated_at = DateTime.local().toISODate()
  }
}

module.exports = Reservation
