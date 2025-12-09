const Payments = require("../../models/payment.model");
const stripe = require('stripe')(`${process.env.STRIPE_SECRET_KEY}`);

async function createPaymentLink({amount, product, chat_id}){
	try{
		const price = Math.round(amount * 100)
		const session = await stripe.checkout.sessions.create({
			line_items: [{
				price_data: {
					currency: 'pln',
					product_data: {
						name: product?.categoryId?.title,
						description: product?.title,
					},
					unit_amount: price,
				},
				quantity: 1,
			}],
			payment_intent_data: {
				metadata: {
					chat_id: `${chat_id}`,
					product_id: `${product?._id}`,
					price: `${product?.price}`
				}
			},
			metadata: {
				chat_id: `${chat_id}`,
				product_id: `${product?._id}`,
				price: `${product?.price}`
			},
			expires_at: Math.floor(Date.now() / 1000) + 1800,
			mode: 'payment',
			success_url: 'https://kptikptekpta.pp.ua/pay/success/',
			cancel_url: 'https://kptikptekpta.pp.ua/pay/cancel/',
		});

		await Payments.create({chat_id, price:`${product?.price}`, payment_id: session?.id, product_id: `${product?._id}`, status: false})
		return session.url
	} catch (e) {
		console.error(e)
	}
}

module.exports = {createPaymentLink}