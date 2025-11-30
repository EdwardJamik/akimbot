if (!process.env.STRIPE_SECRET_KEY) {
	throw new Error('TEST_STRIPE_SECRET_KEY is required');
}

const stripe = require('stripe')(`${process.env.STRIPE_SECRET_KEY}`);

async function createPaymentLink({amount, product, description, chat_id}){
	const session = await stripe.checkout.sessions.create({
		line_items: [{
			price_data: {
				currency: 'pln',
				product_data: {
					name: product,
					description: description,
				},
				unit_amount: amount,
			},
			quantity: 1,
		}],
		metadata: {
			telegram_id: chat_id
		},
		expires_at: Math.floor(Date.now() / 1000) + 3600,
		mode: 'payment',
		success_url: 'http://localhost:5000/api/v1/payment',
		cancel_url: 'http://localhost:5000/api/v1/payment',
	});
	
	return session.url
}

module.exports = {createPaymentLink}