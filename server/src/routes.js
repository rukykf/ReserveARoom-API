const { Router } = require("express")
const ReservationsController = require("../src/controllers/ReservationsController")
const RoomTypesController = require("../src/controllers/RoomTypesController")

let router = Router()

router.get("/room-types", RoomTypesController.index)

module.exports = router
