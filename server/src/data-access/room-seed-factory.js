// Generate some room_types, rooms and pictures of the various room types to seed the database
const _ = require("lodash")

let roomsCount = 1
let roomPicturesCount = 1
let rooms = []

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

function generateRooms(num) {
  for (let i = 0; i < num; i++) {
    const roomType = roomTypes[_.random(0, roomTypes.length - 1)]
    const newRoom = {
      id: roomsCount,
      room_no: 100 + roomsCount,
      room_type_id: roomType.id,
    }
    rooms.push(newRoom)
    roomsCount += 1
  }
}

generateRooms(30)

module.exports.roomTypes = roomTypes
module.exports.rooms = rooms
