const knex = require("knex")
const config = require("../../knexfile")

let db = knex(config.development)

if(process.env.NODE_ENV === "test"){
  db = knex(config.test)
}

module.exports = db