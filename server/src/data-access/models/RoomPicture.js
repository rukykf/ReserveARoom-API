const Objection = require("../db-config")

class RoomPicture extends Objection {
  static get tableName() {
    return "room_pictures"
  }

  static get relationMappings() {
    const RoomType = require("./RoomType")

    return {
      room_type: {
        relation: Objection.BelongsToOneRelation,
        modelClass: RoomType,
        join: {
          from: "room_pictures.room_type_id",
          to: "room_types.id",
        },
      },
    }
  }
}
