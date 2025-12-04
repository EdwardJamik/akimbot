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
			success_url: 'http://localhost:5000/api/v1/payment/result',
			cancel_url: 'http://localhost:5000/api/v1/payment/result',
		});
		
		return session.url
	} catch (e) {
		console.error(e)
	}
}

module.exports = {createPaymentLink}