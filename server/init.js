const chalk = require("chalk")
const dotenv = require("dotenv")
const { prompt } = require("prompts")
const bcrypt = require("bcrypt")

dotenv.config({ path: "./.env" })

const Role = require("./src/data-access/models/Role")
const User = require("./src/data-access/models/User")

/**
 * Confirm that an admin user doesn't already exist. If there is no user, prompt for the information to create one
 * At the moment the idea is to be able to configure only one user and one role for the application
 * This user will be the super admin and will be capable of viewing all reservations that have been placed by guests
 * In the future, this might change.
 **/

async function setupAdminRole() {
  let role = await Role.query().insert({ name: "administrator" })
  return role
}

async function setupAdminUser(role) {
  let username = "",
    fullName = "",
    password = ""

  let response = await prompt({
    type: "text",
    name: "fullName",
    message: "Enter the administrator's full name: ",
    validate: (fullname) => {
      return fullname.length < 1 ? `Full Name is required` : true
    },
  })
  fullName = response.fullName

  response = await prompt({
    type: "text",
    name: "username",
    message: "Enter the administrator's username: ",
    validate: (username) => {
      return username.length < 1 ? `username is required` : true
    },
  })
  username = response.username

  response = await prompt({
    type: "password",
    name: "password",
    message: "Enter the administrator's password: ",
    validate: (password) => {
      return password.length < 8 ? `password should be at least 8 characters long` : true
    },
  })
  password = response.password

  let passwordHash = bcrypt.hashSync(password, 10)
  await User.query().insert({
    username: username,
    full_name: fullName,
    password_hash: passwordHash,
    role_id: role.id,
  })
  console.log(`Administrator ${fullName} was created successfully`)
}

async function init() {
  try {
    let role = await Role.query().first()
    if (role == null) {
      role = await setupAdminRole()
    }

    let user = await User.query().first()
    if (user != null) {
      var response = await prompt({
        type: "text",
        name: "resetPassword",
        message: "Admin user has already been configured, do you want to reset the user's password? (y/n)",
        validate: (resetPassword) => {
          if (resetPassword.toLowerCase() !== "y" && resetPassword.toLowerCase() !== "n") {
            return `Please enter y for yes or n for no`
          }
          return true
        },
      })
      if (response.resetPassword.toLowerCase() === "y") {
        response = await prompt({
          type: "password",
          name: "password",
          message: "Enter the administrator's password: ",
          validate: (password) => {
            return password.length < 8 ? `password should be at least 8 characters long` : true
          },
        })
        let passwordHash = bcrypt.hashSync(response.password, 10)
        await User.query().findById(user.id).patch({ password_hash: passwordHash })
        console.log("Successfully reset administrator's password")
      }

      console.log("Bye")
      process.exit()
    }
    await setupAdminUser(role)
    process.exit()
  } catch (error) {
    console.error(chalk.red("Something went wrong."))
    console.error(chalk.red("Confirm that your environment variables are properly configured in .env"))
    console.error(chalk.red("Confirm that you've run the database migrations for this application and then try again."))
    process.exit()
  }
}

init()
