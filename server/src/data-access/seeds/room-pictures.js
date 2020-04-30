const { roomPictures } = require("../room-seed-factory")

exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("room_pictures")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("room_pictures").insert(roomPictures)
    })
}
