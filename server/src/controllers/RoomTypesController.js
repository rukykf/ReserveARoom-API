const { NotFoundError, ValidationError, UniqueViolationError } = require("objection")
const RoomType = require("../data-access/models/RoomType")
const _ = require("lodash")

module.exports = {
  async index(req, res) {
    let roomTypesQueryBuilder = RoomType.query().where("active", "=", 1)
    if (_.get(req, ["query", "with_rooms"])) {
      roomTypesQueryBuilder.withGraphFetched("rooms")
    }

    if (_.get(req, ["query", "with_pictures"])) {
      roomTypesQueryBuilder.withGraphFetched("room_pictures")
    }

    let roomTypes = await roomTypesQueryBuilder
    return res.json(roomTypes)
  },

  async create(req, res) {
    try {
      let roomType = await RoomType.query().insert({
        name: _.get(req, ["body", "name"]),
        price_per_night: _.get(req, ["body", "price_per_night"]),
        description: _.get(req, ["body", "description"]),
      })
      return res.json(roomType)
    } catch (error) {
      if (error instanceof UniqueViolationError) {
        return res.status(400).json({ message: "this name is already assigned to another room type" })
      }

      if (error instanceof ValidationError) {
        let errorMessages = []
        let modelErrors = Object.keys(error.data)

        modelErrors.forEach((modelError) => {
          error.data[modelError].forEach((e) => {
            errorMessages.push(`${modelError}: ${e.message} `)
          })
        })
        return res.status(400).json({ messages: errorMessages })
      }
      return res.status(500).json({ message: "something went wrong, try again later" })
    }
  },

  async edit(req, res) {
    try {
      let roomType = await RoomType.query()
        .patchAndFetchById(_.toNumber(req.params.id), {
          name: _.get(req, ["body", "name"]),
          price_per_night: _.get(req, ["body", "price_per_night"]),
          description: _.get(req, ["body", "description"]),
        })
        .throwIfNotFound()

      return res.json(roomType)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ message: "the selected room type was not found" })
      }

      if (error instanceof UniqueViolationError) {
        return res.status(400).json({ message: "this name is already assigned to another room type" })
      }

      if (error instanceof ValidationError) {
        let errorMessages = []
        let modelErrors = Object.keys(error.data)

        modelErrors.forEach((modelError) => {
          error.data[modelError].forEach((e) => {
            errorMessages.push(`${modelError}: ${e.message} `)
          })
        })

        return res.status(400).json({ messages: errorMessages })
      }

      return res.status(500).json({ message: "something went wrong, please try again later" })
    }
  },

  async show(req, res) {
    try {
      let roomType = await RoomType.query().findById(_.toNumber(req.params.id)).throwIfNotFound()
      return res.json(roomType)
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ message: "could not find selected room type" })
      }

      return res.status(500).json({ message: "something went wrong, try again later" })
    }
  },

  async delete(req, res) {
    try {
      await RoomType.query().findById(_.toNumber(req.params.id)).throwIfNotFound().patch({
        active: false,
      })
      return res.json({ message: "successfully deleted selected room type" })
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(400).json({ message: "could not delete selected room type" })
      }
      return res.status(500).json({ message: "something went wrong, try again later" })
    }
  },

  async uploadImageForRoomType(req, res) {
    console.log("upload image")
  },

  async deleteImageForRoomType(req, res) {
    console.log("delete image")
  },
}
