// Generate some room_types, rooms and pictures of the various room types to seed the database
const _ = require("lodash")
const faker = require("faker")
const { DateTime } = require("luxon")
const dotenv = require("dotenv")

dotenv.config("../../.env")

let roomsCount = 1
let roomPicturesCount = 1
let reservationsCount = 1
let rooms = []
let roomPictures = []
let reservations = []

const roomTypes = [
  { id: 1, price_per_night: 70, name: "classic", description: "1 small bed with 1 bath" },
  { id: 2, price_per_night: 120, name: "2 Beds", description: "2 beds with 1 baths" },
  { id: 3, price_per_night: 150, name: "VIP", description: "1 master bed with 1 bath plus complementary meals" },
  {
    id: 4,
    price_per_night: 200,
    name: "VIP-Suite",
    description: "2 bedrooms ensuite with 1 living room plus complementary meals",
  },
]

// There are four images prefixed with bedroom in the static files directory of this repo's root
// Generate the Urls for these images and load them into an array
let testPicturesUrls = []
for (let i = 1; i < 5; i++) {
  let url = `${process.env.APP_HOST}:${process.env.PORT}/bedroom-${i}.jpg`
  testPicturesUrls.push(url)
}

roomTypes.forEach((roomType) => {
  testPicturesUrls.forEach((pictureUrl) => {
    roomPictures.push({
      id: roomPicturesCount,
      room_type_id: roomType.id,
      image_url: pictureUrl,
    })
    roomPicturesCount += 1
  })
})

function generateHistoricalReservations(room) {
  let num = faker.random.arrayElement([0, 1, 2])
  let currentDate = DateTime.local()
  for (let i = 0; i < num; i++) {
    let numBreaks = faker.random.arrayElement([3, 8, 30])
    let numDays = faker.random.arrayElement([2, 4, 7])
    let endDate = currentDate.minus({ days: numBreaks })
    let startDate = endDate.minus({ days: numDays })
    currentDate = startDate
    let newReservation = {
      id: reservationsCount,
      room_id: room.id,
      created_at: startDate.toISODate(),
      updated_at: endDate.toISODate(),
      start_date: startDate.toISODate(),
      end_date: endDate.toISODate(),
      start_datetime: startDate.toISO(),
      end_datetime: endDate.toISO(),
      guest_phone_number: "+00000000000",
      guest_name: "guest name",
      status: "closed",
    }
    reservations.push(newReservation)
    reservationsCount += 1
  }
}

function generateUpcomingReservations(room) {
  let num = faker.random.arrayElement([0, 1, 2])
  let currentDate = DateTime.local()
  for (let i = 0; i < num; i++) {
    let numBreaks = faker.random.arrayElement([3, 8, 30])
    let numDays = faker.random.arrayElement([2, 4, 7])
    let startDate = currentDate.plus({ days: numBreaks })
    let endDate = startDate.plus({ days: numDays })
    currentDate = endDate
    let newReservation = {
      id: reservationsCount,
      room_id: room.id,
      created_at: startDate.toISODate(),
      updated_at: endDate.toISODate(),
      start_date: startDate.toISODate(),
      end_date: endDate.toISODate(),
      start_datetime: startDate.toISO(),
      end_datetime: endDate.toISO(),
      guest_phone_number: "+00000000000",
      guest_name: "guest name",
      status: "open",
    }
    reservations.push(newReservation)
    reservationsCount += 1
  }
}

function generateRooms(num) {
  for (let i = 0; i < num; i++) {
    const roomType = roomTypes[_.random(0, roomTypes.length - 1)]
    const newRoom = {
      id: roomsCount,
      room_no: 100 + roomsCount,
      room_type_id: roomType.id,
    }
    rooms.push(newRoom)
    generateUpcomingReservations(newRoom)
    generateHistoricalReservations(newRoom)
    roomsCount += 1
  }
}

generateRooms(10)

module.exports.roomTypes = roomTypes
module.exports.rooms = rooms
module.exports.roomPictures = roomPictures
module.exports.reservations = reservations
