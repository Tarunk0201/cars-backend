// src/utils/telegram.js

const axios = require("axios");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const sendTelegramMessage = async (message) => {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: CHAT_ID,
      text: message,
      parse_mode: "HTML",
    });
    console.log("Telegram message sent successfully");
  } catch (error) {
    console.error(
      "Failed to send Telegram message:",
      error.response ? error.response.data : error.message
    );
  }
};

module.exports = { sendTelegramMessage };
