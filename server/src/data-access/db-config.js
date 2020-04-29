const dotenv = require("dotenv")
const { Model } = require("objection")
const { AjvValidator } = require("objection")
const knex = require("knex")
const config = require("../../knexfile")

let db = knex(config.development)

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
