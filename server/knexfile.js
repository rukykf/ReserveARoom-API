const path = require("path")

module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: "./reservations.db",
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, "src/data-access/migrations"),
    },
    seeds: {
      directory: path.join(__dirname, "src/data-access/seeds")
    },
  },
  production: {},
  test: {
    client: "sqlite3",
    connection: ":memory:",
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, "src/data-access/migrations")
    },
    seeds: {
      directory: path.join(__dirname, "src/data-access/seeds")
    }
  }
}
