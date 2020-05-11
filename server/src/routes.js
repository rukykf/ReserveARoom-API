const { Router } = require("express")
const ReservationsController = require("../src/controllers/ReservationsController")
const RoomTypesController = require("../src/controllers/RoomTypesController")
const AuthenticationController = require("../src/controllers/AuthenticationController")

let router = Router()

router.post("/session-login", AuthenticationController.login)
router.post("/session-logout", AuthenticationController.logout)

router.post("/rooms/:id/reservations", ReservationsController.createReservationForRoom)
router.get("/rooms/:id/reservations", ReservationsController.getReservationsCalendarForRoom)

router.get("/reservations", ReservationsController.getAllReservations)
router.post("/reservations/:id", ReservationsController.updateReservationStatus)
router.put("/reservations/:id/otp", ReservationsController.resendOtpForReservation)
router.post("/reservations/:id/otp", ReservationsController.confirmReservation)


module.exports = router
