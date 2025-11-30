const { Telegraf, Markup } = require('telegraf');

const response = require('./response')

const bot = new Telegraf(`${process.env.BOT_TOKEN}`)

response(bot)

module.exports = bot
