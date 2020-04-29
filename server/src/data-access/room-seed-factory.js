// Generate some room_types, rooms and pictures of the various room types to seed the database
const _ = require("lodash")

let roomsCount = 1
let roomPicturesCount = 1
let rooms = []
let otps = []

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

function generateHistoricalReservations(room) {
  let num = faker.random.arrayElement([0, 2, 5])
  let currentDate = DateTime.local()
  for (let i = 0; i < num; i++) {
    let numBreaks = faker.random.arrayElement([3, 8, 30])
    let numDays = faker.random.arrayElement([2, 4, 7])
    let closeDate = currentDate.minus({ days: numBreaks })
    let startDate = closeDate.minus({ days: numDays })
    let customerDetails = faker.random.arrayElement([
      { customer_name: "Rukky Kofi", customer_phone: "081234567891" },
      { customer_name: "Nero Kofi", customer_phone: "0813234444444" },
    ])
    currentDate = startDate
    let newReservation = {
      id: reservationsCount,
      room_id: room.id,
      created_at: startDate.toISODate(),
      updated_at: closeDate.toISODate(),
      close_date: closeDate.toISODate(),
      customer_details: JSON.stringify(customerDetails),
      status: "closed",
    }
    reservations.push(newReservation)
    reservationsCount += 1
  }
}

function generateUpcomingReservations(room) {
  let num = faker.random.arrayElement([0, 2, 5])
  let currentDate = DateTime.local()
  for (let i = 0; i < num; i++) {
    let numBreaks = faker.random.arrayElement([3, 8, 30])
    let numDays = faker.random.arrayElement([2, 4, 7])
    let startDate = currentDate.plus({ days: numBreaks })
    let closeDate = startDate.plus({ days: numDays })
    let customerDetails = faker.random.arrayElement([
      { customer_name: "Rukky Kofi", customer_phone: "081234567891" },
      { customer_name: "Nero Kofi", customer_phone: "0813234444444" },
    ])
    currentDate = closeDate
    let newReservation = {
      id: reservationsCount,
      room_id: room.id,
      created_at: startDate.toISODate(),
      updated_at: closeDate.toISODate(),
      close_date: closeDate.toISODate(),
      customer_details: JSON.stringify(customerDetails),
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

generateRooms(30)

module.exports.roomTypes = roomTypes
module.exports.rooms = rooms
