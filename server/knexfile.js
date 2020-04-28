module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: "./reservations.db",
    },
    useNullAsDefault: true,
    migrations: {
      directory: __dirname + "/src/data-access/migrations",
    },
    seeds: {
      directory: __dirname + "/src/data-access/seeds",
    },
  },
  production: {},
}
