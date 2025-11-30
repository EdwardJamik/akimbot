const User = require("../models/user.model")
const MessageTemplate = require("../models/messages.model")
const bot = require("../bot")
const { audioConvert, audioConvertBuffer } = require("../bot/utils/audioConvert")
const Category = require("../models/category.model")
const Courses = require("../models/courses.model")
const Tasks = require("../models/tasks.model")

const getUsers = async (req, res) => {
	try {
		const usersList = await User.find().sort({ createdAt: -1 })
		res.json(usersList)
	} catch (e) {
		console.error("Get users error:", e)
		res.status(500).json({ message: "Server error" })
	}
}

module.exports = {
	getUsers
}
