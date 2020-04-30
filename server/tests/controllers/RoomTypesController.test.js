const RoomType = require("../../src/data-access/models/RoomType")
const RoomTypesController = require("../../src/controllers/RoomTypesController")

beforeEach(async () => {
  await RoomType.query().delete()
})

afterEach(async () => {
  await RoomType.query().delete()
})

test("RoomTypesController.index returns list of available room types", async () => {
  let roomType = await RoomType.query().insert({
    name: "room type",
    price_per_night: 5000,
    description: "some description",
  })
  let res = { json: jest.fn() }
  let req = {}
  await RoomTypesController.index(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining(roomType)]))
})

test("RoomTypesController.create returns newly created room type when passed valid data", async () => {
  let req = { body: { name: "room type", price_per_night: 9000, description: "some description" } }
  let res = { json: jest.fn() }
  await RoomTypesController.create(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining(req.body))
})

test("RoomTypesController.create returns error message when passed invalid json schema", async () => {
  let req = { body: { name: "room type", price_per_night: 200 } }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await RoomTypesController.create(req, res)
  expect(res.json).toHaveBeenCalledWith({ messages: expect.arrayContaining([expect.anything()]) })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("RoomTypesController.create returns error message when passed duplicate room type name", async () => {
  let roomType = await RoomType.query().insert({
    name: "some-room-type",
    price_per_night: 5000,
    description: "some description",
  })
  let req = { body: { name: "some-room-type", price_per_night: 5000, description: "different description" } }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await RoomTypesController.create(req, res)
  expect(res.json).toHaveBeenCalledWith({ message: "this name is already assigned to another room type" })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("RoomTypesController.edit returns updated role when passed valid data", async () => {
  let roomType = await RoomType.query().insert({
    name: "room type",
    price_per_night: 2000,
    description: "some description",
  })
  let req = { body: { price_per_night: 9000 }, params: { id: roomType.id } }
  let res = { json: jest.fn() }
  await RoomTypesController.edit(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining(req.body))
})

test("RoomTypesController.edit returns error message when passed invalid id", async () => {
  let req = { body: { price_per_night: 9000 }, params: { id: 50 } }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await RoomTypesController.edit(req, res)
  expect(res.json).toHaveBeenCalledWith({ message: "the selected room type was not found" })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("RoomTypesController.show returns selected room type when passed valid id", async () => {
  let roomType = await RoomType.query().insert({
    name: "room type",
    price_per_night: 2000,
    description: "some description",
  })
  let req = { params: { id: roomType.id } }
  let res = { json: jest.fn() }
  await RoomTypesController.show(req, res)
  expect(res.json).toHaveBeenCalledWith(roomType)
})

test("RoomTypesController.show returns error when passed invalid id", async () => {
  let req = { params: { id: 23 } }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await RoomTypesController.show(req, res)
  expect(res.json).toHaveBeenCalledWith({ message: "could not find selected room type" })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("RoomTypesController.delete returns success message when passed valid id", async () => {
  let roomType = await RoomType.query().insert({
    name: "room type",
    price_per_night: 2000,
    description: "some description",
  })
  let req = { params: { id: roomType.id } }
  let res = { json: jest.fn() }
  await RoomTypesController.delete(req, res)
  expect(res.json).toHaveBeenCalledWith({ message: "successfully deleted selected room type" })
})

test("RoomTypesController.delete returns error message when passed invalid id", async () => {
  let req = { params: { id: 23 } }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await RoomTypesController.delete(req, res)
  expect(res.json).toHaveBeenCalledWith({ message: "could not delete selected room type" })
  expect(res.status).toHaveBeenCalledWith(400)
})
