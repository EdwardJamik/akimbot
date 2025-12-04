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

const resultPayment = async (req, res) => {
	try {
		console.log('tut')
		const sig = req.headers['stripe-signature'];
		
		let event;
		try {
			event = stripe.webhooks.constructEvent(
				req.body,
				sig,
				process.env.STRIPE_WEBHOOK_SECRET
			);
		} catch (err) {
			console.log("❌ Webhook error:", err.message);
			return res.status(400).send(`Webhook error: ${err.message}`);
		}
		
		// ⬇️ Ось цей івент приходить після успішної оплати
		if (event.type === 'checkout.session.completed') {
			const session = event.data.object;
			console.log("✅ PAYMENT SUCCESS:", session);
		}
		
		res.sendStatus(200);
		
	} catch (e) {
		console.error("Get users error:", e)
		res.status(500).json({ message: "Server error" })
	}
}

module.exports = {
	getUsers, resultPayment
}
