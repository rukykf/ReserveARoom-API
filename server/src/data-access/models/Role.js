const Objection = require("../objection-config")

class Role extends Objection {
  static get tableName() {
    return "roles"
  }

  static get relationMappings() {
    const User = require("./User")

    return {
      user: {
        relation: Objection.HasManyRelation,
        modelClass: User,
        join: {
          from: "roles.id",
          to: "users.role_id",
        },
      },
    }
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["name"],
      properties: {
        id: { type: "integer" },
        name: { type: "string", minLength: 1, transform: ["trim", "toLowerCase"] },
      },
    }
  }
}

module.exports = Role
