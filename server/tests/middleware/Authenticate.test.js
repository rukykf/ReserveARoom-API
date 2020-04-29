const Authenticate = require("../../src/middleware/Authenticate")

test("Authenticate returns error message for requests from unauthenticated user", () => {
  let req = {}
  let res = { json: jest.fn(), status: jest.fn() }
  let next = jest.fn()
  res.status.mockReturnThis()
  Authenticate(req, res, next)
  expect(res.status).toHaveBeenCalledWith(401)
  expect(res.json).toHaveBeenCalledWith({ messages: ["unauthorized access"] })
})

test("Authenticate calls next() for requests from authenticated user", () => {
  let req = { session: { user: "some user data" } }
  let res = { json: jest.fn() }
  let next = jest.fn()
  Authenticate(req, res, next)
  expect(next).toHaveBeenCalledTimes(1)
})
