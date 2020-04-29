const queryString = require("querystring")
const twilio = require("twilio")
const axios = require("axios")

const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

async function sendMessage(message, phoneNumber) {
  await client.messages.create({
    body: message,
    to: phoneNumber,
    from: process.env.TWILIO_FROM_NUMBER,
  })
}

module.exports = sendMessage
