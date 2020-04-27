const { ValidationError } = require("objection")
const Objection = require("../db-config")

class RoomType extends Objection {
  static get tableName() {
    return "room_types"
  }

  static get relationMappings() {
    const Room = require("./Room")
    const RoomPicture = require("./RoomPicture")

    return {
      room: {
        relation: Objection.HasManyRelation,
        modelClass: Room,
        join: {
          from: "room_types.id",
          to: "room.room_type_id",
        },
      },

      room_pictures: {
        relation: Objection.HasManyRelation,
        modelClass: RoomPicture,
        join: {
          from: "room_types.id",
          to: "room_pictures.room_type_id",
        },
      },
    }
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["price_per_night", "name", "description"],
      properties: {
        price_per_night: { type: "number" },
        name: { type: "string", minLength: 1, transform: ["trim", "toLowerCase"] },
        description: { type: "string", transform: ["trim", "toLowerCase"] },
      },
    }
  }
}
module.exports = RoomType
