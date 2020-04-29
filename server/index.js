const dotenv = require("dotenv")
dotenv.config({ path: "./.env" })

const express = require("express")
const history = require("connect-history-api-fallback")
const path = require("path")
const app = express()
const port = process.env.PORT
const ReservationsController = require("./src/controllers/ReservationsController")
//
app.use(express.static(path.join(__dirname, "static/dist")))
app.use(express.json())

// app.use(history())

app.post("/rooms/:id", ReservationsController.createReservationForRoom)
app.listen(port, "0.0.0.0", () => console.log(`Example app listening on port ${port}!`))
