const Objection = require("../db-config")

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
      required: ["room_id", "start_date", "end_date", "guest_name", "guest_phone_number", "status"],
      properties: {
        id: { type: "integer" },
        room_id: { type: "integer" },
        end_date: { type: "string", transform: ["trim"] },
        start_date: { type: "string", transform: ["trim"] },
        guest_name: { type: "string", transform: ["trim", "toLowerCase"] },
        guest_phone_number: { type: "string", transform: ["trim"] },
        status: { type: "string", enum: ["pending-confirmation", "failed-confirmation", "open", "closed", "expired"] },
      },
    }
  }

  $beforeInsert(queryContext) {
    this.created_at = DateTime.local().toISO()
    this.updated_at = DateTime.local().toISO()
  }

  $beforeUpdate(opt, queryContext) {
    this.updated_at = DateTime.local().toISO()
  }
}

module.exports = Reservation
