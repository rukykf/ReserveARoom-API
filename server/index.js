const dotenv = require("dotenv")
dotenv.config({ path: "./.env" })

const express = require("express")
const session = require("express-session")
const history = require("connect-history-api-fallback")
const path = require("path")
const cors = require("cors")

const routes = require("./src/routes")

const app = express()
const port = process.env.PORT


app.use(express.static(path.join(__dirname, "static/uploads")))
app.use(express.static(path.join(__dirname, "static/dist")))
app.use(express.json())

if (process.env.NODE_ENV === "development") {
  // enable cors to make it easy to make api calls to the server from my vue spa project
  app.use(cors())
} else {
  // ensure that all direct get requests that accept text/html are redirected to index.html
  app.use(history())
}


app.use("/api", routes)
app.use(session({ secret: process.env.APP_SECRET, resave: false, saveUninitialized: true }))
app.listen(port, process.env.APP_HOST, () => console.log(`ReserveARoom app listening on port ${port}!`))
