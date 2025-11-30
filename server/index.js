const mongoose = require("mongoose");
const app = require("./server.js");
require("dotenv").config();
const bot = require('./bot');
const { MONGO_URL, PORT } = process.env
const listen_port = PORT || 6000;

mongoose.connect(MONGO_URL, {
	// useNewUrlParser: true,
	// useUnifiedTopology: true,
}).then(() => {
	console.log('MongoDB is connected successfully')
	bot.launch( () => {
		console.info(`Telegram bot is running`);
	})
	app.listen(listen_port, () => console.log(`Server running on PORT : ${listen_port}`))
}).catch(err => console.error(err))

