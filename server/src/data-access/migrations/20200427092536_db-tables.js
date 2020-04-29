exports.up = function (knex) {
  knex.schema
    .createTable("room_types", (table) => {
      table.increments("id")
      table.float("price_per_night")
      table.string("name")
      table.string("description")
      table.boolean("active").defaultTo(true)
      table.unique("name")
    })
    .then(() => {
      console.log("created room_types")
    })

  knex.schema
    .createTable("rooms", (table) => {
      table.increments("id")
      table.integer("room_no")
      table.integer("room_type_id")
      table.boolean("active").defaultTo(true)
      table.unique("room_no")
    })
    .then(() => {
      console.log("created rooms")
    })

  knex.schema
    .createTable("roles", (table) => {
      table.increments("id")
      table.string("name")
      table.boolean("active").defaultTo(true)
      table.unique("name")
    })
    .then(() => {
      console.log("created roles")
    })

  knex.schema
    .createTable("users", (table) => {
      table.increments("id")
      table.string("username")
      table.string("full_name")
      table.string("password_hash")
      table.integer("role_id")
      table.boolean("active").defaultTo(true)
      table.unique("username")
    })
    .then(() => {
      console.log("created users")
    })

  knex.schema
    .createTable("reservations", (table) => {
      table.increments("id")
      table.integer("room_id")
      table.timestamps()
      table.string("start_date")
      table.string("end_date")
      table.string("start_datetime")
      table.string("end_datetime")
      table.string("guest_phone_number")
      table.string("guest_name")
      table
        .enum("status", ["pending-confirmation", "failed-confirmation", "open", "closed", "expired"])
        .defaultTo("pending-confirmation")
    })
    .then(() => {
      console.log("created reservations")
    })

  knex.schema
    .createTable("otps", (table) => {
      table.increments("id")
      table.timestamps()
      table.integer("reservation_id")
      table.string("otp_code")
    })
    .then(() => {
      console.log("created otps")
    })

  knex.schema
    .createTable("room_pictures", (table) => {
      table.increments("id")
      table.integer("room_type_id")
      table.string("image_url")
    })
    .then(() => {
      console.log("created room_pictures")
    })
}

exports.down = function (knex) {
  knex.schema.dropTable("rooms").then(() => {
    console.log("dropped rooms")
  })

  knex.schema.dropTable("room_types").then(() => {
    console.log("dropped room_types")
  })

  knex.schema.dropTable("roles").then(() => {
    console.log("dropped roles")
  })

  knex.schema.dropTable("users").then(() => {
    console.log("dropped users")
  })

  knex.schema.dropTable("reservations").then(() => {
    console.log("dropped reservations")
  })

  knex.schema.dropTable("otps").then(() => {
    console.log("dropped otps")
  })

  knex.schema.dropTable("room_pictures").then(() => {
    console.log("dropped room_pictures")
  })
}
