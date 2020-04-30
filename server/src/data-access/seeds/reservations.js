const { reservations } = require("../room-seed-factory")

exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("reservations")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("reservations").insert(reservations)
    })
}
