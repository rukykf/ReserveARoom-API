const { roomTypes } = require("../room-seed-factory")

exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("room_types")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("room_types").insert(roomTypes)
    })
}
