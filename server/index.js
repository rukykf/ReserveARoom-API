const dotenv = require("dotenv")
dotenv.config({ path: "./.env" })

const express = require("express")
const session = require("express-session")
const history = require("connect-history-api-fallback")
const path = require("path")
const app = express()
const port = process.env.PORT
const ReservationsController = require("./src/controllers/ReservationsController")
const AuthenticationController = require("./src/controllers/AuthenticationController")

app.use(express.static(path.join(__dirname, "static/uploads")))
app.use(express.static(path.join(__dirname, "static/dist")))

app.use(express.json())
app.use(session({ secret: "hello-world", resave: false, saveUninitialized: true }))

// app.use(history())

app.post("/rooms/:id", ReservationsController.createReservationForRoom)
app.post("/logout", AuthenticationController.logout)

app.listen(port, "0.0.0.0", () => console.log(`ReserveARoom app listening on port ${port}!`))
