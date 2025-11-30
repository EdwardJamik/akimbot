const { Telegraf, Markup } = require('telegraf');
require('dotenv').config()

const response = require('./response')

const bot = new Telegraf(`${process.env.BOT_TOKEN}`)

response(bot)

module.exports = bot
