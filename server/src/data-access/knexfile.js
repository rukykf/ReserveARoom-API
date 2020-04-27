module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: "./reservations.db",
    },
    useNullAsDefault: true,
  },
}
