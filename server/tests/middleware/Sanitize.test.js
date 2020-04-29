const Sanitize = require("../../src/middleware/Sanitize")

test("Sanitize escapes unsafe html characters in strings", () => {
  let req = {
    body: { unsafe: "safe goes here<script>alert(0)</script>", safe: "some-string" },
    query: { unsafe: ["some item<script>alert(2)</script>", "safe item"] },
    params: { unsafe_obj: { unsafe: "nested script<script>alert(30)", safe: "another safe item" } },
  }
  let res = {}
  let next = jest.fn()
  Sanitize(req, res, next)
  expect(req.body.unsafe).toEqual("safe goes here")
  expect(req.body.safe).toEqual("some-string")
  expect(req.query.unsafe[0]).toEqual("some item")
  expect(req.query.unsafe[1]).toEqual("safe item")
  expect(req.params.unsafe_obj.unsafe).toEqual("nested script")
  expect(req.params.unsafe_obj.safe).toEqual("another safe item")
  expect(next).toHaveBeenCalledTimes(1)
})
