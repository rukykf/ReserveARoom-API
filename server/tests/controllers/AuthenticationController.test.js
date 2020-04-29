const bcrypt = require("bcrypt")
const AuthenticationController = require("../../src/controllers/AuthenticationController")
const User = require("../../src/data-access/models/User")
const Role = require("../../src/data-access/models/Role")

test("AuthenticationController.login returns authenticated user when passed valid credentials", async () => {
  await User.query().delete()
  await Role.query().delete()
  let newRole = await Role.query().insert({ name: "my-role" })
  let user = await User.query().insert({
    username: "myuser",
    full_name: "firstname lastname",
    password_hash: bcrypt.hashSync("password", 10),
    role_id: newRole.id,
  })
  let req = {
    body: {
      username: "myuser",
      password: "password",
    },
  }
  let res = { json: jest.fn() }
  await AuthenticationController.login(req, res)
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({ username: "myuser", full_name: "firstname lastname", role_id: newRole.id })
  )
  await User.query().delete()
  await Role.query().delete()
})

test("AuthenticationController.login returns error message when passed invalid credentials", async () => {
  await User.query().delete()
  let req = {
    body: {
      username: "myuser",
      password: "password",
    },
  }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await AuthenticationController.login(req, res)
  expect(res.json).toHaveBeenCalledWith({ message: "invalid login credentials" })
  expect(res.status).toHaveBeenCalledWith(400)
})
