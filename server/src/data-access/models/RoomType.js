const { ValidationError } = require("objection")
const Objection = require("../objection-config")
const _ = require("lodash")

class RoomType extends Objection {
  static get tableName() {
    return "room_types"
  }

  static get relationMappings() {
    const Room = require("./Room")
    const RoomPicture = require("./RoomPicture")

    return {
      rooms: {
        relation: Objection.HasManyRelation,
        modelClass: Room,
        join: {
          from: "room_types.id",
          to: "rooms.room_type_id",
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

  $parseDatabaseJson(json) {
    super.$parseDatabaseJson(json)
    json = _.omit(json, ["active"])
    return json
  }
}
module.exports = RoomType
