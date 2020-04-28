const dotenv = require("dotenv")
const { Model } = require("objection")
const { AjvValidator } = require("objection")
const knex = require("knex")
const config = require("../../knexfile")

// dotenv.config({ path: "../../.env" })

let db = null
if (process.env.NODE_ENV === "development") {
  db = knex(config.development)
} else {
  db = knex(config.production)
}

Model.knex(db)

class BaseModel extends Model {
  static createValidator() {
    return new AjvValidator({
      onCreateAjv(ajv) {
        require("ajv-keywords")(ajv, "transform")
      },
    })
  }
}

module.exports = BaseModel
