const db = require("./db-config")
const { Model } = require("objection")
const { AjvValidator } = require("objection")

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
