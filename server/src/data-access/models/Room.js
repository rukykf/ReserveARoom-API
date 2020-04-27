const Objection = require("../db-config")

class Room extends Objection {
  static get tableName() {
    return "rooms"
  }

  static get relationMappings() {
    const RoomType = require("./RoomType")
    const Reservation = require("./Reservation")

    return {
      room_type: {
        relation: Objection.BelongsToOneRelation,
        modelClass: RoomType,
        join: {
          from: "rooms.room_type_id",
          to: "room_types.id",
        },
      },

      reservations: {
        relation: Objection.HasManyRelation,
        modelClass: Reservation,
        join: {
          from: "rooms.id",
          to: "reservations.room_id",
        },
      },
    }
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["room_no", "room_type_id"],
      properties: {
        id: { type: "integer" },
        room_no: { type: "integer" },
        room_type_id: { type: "integer" },
      },
    }
  }
}
module.exports = Room
