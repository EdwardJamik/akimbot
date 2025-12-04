const User = require("../models/user.model")
const Payments = require("../models/payment.model")
const stripe = require('stripe')
const {setUserAction} = require('../bot/utils/userSync')
const {findTextButton} = require('../bot/utils/buttonController')
const {selectButton} = require('../bot/keyboards/keyboard')
const {sendMessage, sendMessageDefault} = require('../bot/utils/sendMessage')
const bot = require('../bot')

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
		const sig = req.headers['stripe-signature'];
		
		let event;
		try {
			event = stripe.webhooks.constructEvent(
				req.body,
				sig,
				"whsec_WQgJTEeJQCqkHjan2hgGzCPqS0LS1XqB"
			);
		} catch (err) {
			console.log("❌ Webhook error:", err.message);
			return res.status(400).send(`Webhook error: ${err.message}`);
		}
		
		const session = event.data.object;
		
		if(event.type === 'checkout.session.completed'){
			const chat_id = session?.metadata?.chat_id
			const product_id = session?.metadata?.product_id
			const price = session?.metadata?.price
			const payment_mail = session?.customer_details?.email
			const card_holder = session?.customer_details?.name
			const payment_id = session?.id
			
			const savePayment = await Payments.create({chat_id, price, payment_mail, card_holder, payment_id, product_id, status: true})
			
			const message = await findTextButton('success_payment_message');
			await sendMessageDefault({bot, chat_id, ...message, save: true})
			await setUserAction({chat_id, action: `paymentSuccess_${product_id}_${savePayment?._id}`})
		} else if(event.type === 'checkout.session.expired') {
			const chat_id = session?.metadata?.chat_id
			const product_id = session?.metadata?.product_id
			const price = session?.metadata?.price
			const payment_id = session?.id
			
			const savePayment = await Payments.create({chat_id, price, payment_id, product_id, status: false})
			
			const button = await selectButton('start_bot');
			const message = await findTextButton('expired_payment_message');
			await sendMessageDefault({bot, chat_id, ...message, button, save: true})
			await setUserAction({chat_id, action: `paymentExpired_${product_id}_${savePayment?._id}`})
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
