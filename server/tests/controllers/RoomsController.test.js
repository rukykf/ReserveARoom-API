const db = require("../../../server/src/data-access/db-config")
const Room = require("../../src/data-access/models/Room")
const RoomType = require("../../src/data-access/models/RoomType")
const RoomsController = require("../../src/controllers/RoomsController")

let newRoomType = null

beforeAll(async () => {
  await db.migrate.latest()
  newRoomType = await RoomType.query().insert({
    name: "room type",
    price_per_night: 9000,
    description: "some description",
  })
})

beforeEach(async () => {
  await Room.query().delete()
})

afterEach(async () => {
  await Room.query().delete()
})

afterAll(async () => {
  await RoomType.query().delete()
})

test("RoomsController.index returns list of available rooms", async () => {
  let room = await Room.query().insert({ room_no: 201, room_type_id: newRoomType.id })
  let res = { json: jest.fn() }
  let req = {}
  await RoomsController.index(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining(room)]))
})

test("RoomsController.create returns newly created room when passed valid data", async () => {
  let req = {
    body: {
      room_no: 102,
      room_type_id: newRoomType.id,
    },
  }
  let res = { json: jest.fn() }
  await RoomsController.create(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining(req.body))
})

test("RoomsController.create returns error message when passed invalid json schema", async () => {
  let req = {
    body: {
      room_type_id: newRoomType.id,
    },
  }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await RoomsController.create(req, res)
  expect(res.json).toHaveBeenCalledWith({ messages: [expect.anything()] })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("RoomsController.create returns error message when passed duplicate room number", async () => {
  let room = await Room.query().insert({ room_no: 201, room_type_id: newRoomType.id })
  let req = {
    body: {
      room_no: 201,
      room_type_id: newRoomType.id,
    },
  }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await RoomsController.create(req, res)
  expect(res.json).toHaveBeenCalledWith({ message: "this number is already assigned to another room" })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("RoomsController.edit returns updated room when passed valid data", async () => {
  let room = await Room.query().insert({ room_no: 203, room_type_id: newRoomType.id })
  let req = {
    params: { id: room.id },
    body: {
      room_no: 209,
    },
  }
  let res = { json: jest.fn() }
  await RoomsController.edit(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining(req.body))
})

test("RoomsController.edit returns error message when passed invalid id", async () => {
  let req = {
    params: { id: 53 },
    body: {
      room_no: 209,
    },
  }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await RoomsController.edit(req, res)
  expect(res.json).toHaveBeenCalledWith({ message: "could not find selected room" })
})

test("RoomsController.show returns selected room when passed valid id", async () => {
  let room = await Room.query().insert({ room_no: 203, room_type_id: newRoomType.id })
  let req = { params: { id: room.id } }
  let res = { json: jest.fn() }
  await RoomsController.show(req, res)
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining(room))
})

test("RoomsController.show returns error message when passed invalid id", async () => {
  let req = { params: { id: 29 } }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await RoomsController.show(req, res)
  expect(res.json).toHaveBeenCalledWith({ message: "could not find selected room" })
  expect(res.status).toHaveBeenCalledWith(400)
})

test("RoomsController.delete returns success message when passed valid id", async () => {
  let room = await Room.query().insert({ room_no: 203, room_type_id: newRoomType.id })
  let req = { params: { id: room.id } }
  let res = { json: jest.fn() }
  await RoomsController.delete(req, res)
  expect(res.json).toHaveBeenCalledWith({ message: "successfully deleted selected room type" })
})

test("RoomsController.delete returns error message when passed invalid id", async () => {
  let req = { params: { id: 29 } }
  let res = { json: jest.fn(), status: jest.fn() }
  res.status.mockReturnThis()
  await RoomsController.delete(req, res)
  expect(res.json).toHaveBeenCalledWith({ message: "could not delete selected room" })
  expect(res.status).toHaveBeenCalledWith(400)
})
