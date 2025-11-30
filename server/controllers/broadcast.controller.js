const User = require("../models/user.model")
const Broadcast = require("../models/broadcast.model")
const bot = require("../bot")
const { sendMessage } = require("../bot/utils/sendMessage")
const { audioConvert } = require("../bot/utils/audioConvert")

const sendMediaToTelegram = async (file, type) => {
	if (!file) return null
	
	const chatId = process.env.TELEGRAM_MEDIA_CHAT_ID
	let response
	
	if (type === "image") {
		response = await bot.telegram.sendPhoto(chatId, { source: file.buffer })
		return response.photo.at(-1).file_id
	}
	
	if (type === "video") {
		response = await bot.telegram.sendVideo(chatId, { source: file.buffer })
		return response.video.file_id
	}
	
	if (type === "audio") {
		const convertedBuffer = await audioConvert(file.buffer)
		response = await bot.telegram.sendVoice(chatId, { source: convertedBuffer })
		return response.voice.file_id
	}
	
	return null
}

const getBroadcastHistory = async (req, res) => {
	try {
		const history = await Broadcast.find().sort({ sentAt: -1 }).limit(10)
		
		const userCount = await User.countDocuments({ ban: false })
		
		res.json({
			history,
			totalActiveUsers: userCount,
		})
	} catch (e) {
		console.error("Get broadcast history error:", e)
		res.status(500).json({ message: "Server error" })
	}
}

const getBroadcastStatus = async (req, res) => {
	try {
		const { broadcastId } = req.params
		
		const broadcast = await Broadcast.findById(broadcastId)
		
		if (!broadcast) {
			return res.status(404).json({ message: "Broadcast not found" })
		}
		
		res.json(broadcast)
	} catch (e) {
		console.error("Get broadcast status error:", e)
		res.status(500).json({ message: "Server error" })
	}
}

// Надіслати розсилку всім користувачам
const sendBroadcast = async (req, res) => {
	try {
		const { message } = req.body
		
		if (!message) {
			return res.status(400).json({ message: "Message is required" })
		}
		
		const fileImage = req.files?.image?.[0] || null
		const fileVideo = req.files?.video?.[0] || null
		const fileAudio = req.files?.audio?.[0] || null
		
		let image = null
		let video = null
		let audio = null
		
		if (fileImage) image = await sendMediaToTelegram(fileImage, "image")
		if (fileVideo) video = await sendMediaToTelegram(fileVideo, "video")
		if (fileAudio) audio = await sendMediaToTelegram(fileAudio, "audio")
		
		// Отримати всіх користувачів, крім заблокованих
		const users = await User.find({ ban: false })
		
		// Створити запис про розсилку
		const broadcast = await Broadcast.create({
			message,
			image,
			video,
			audio,
			status: "sending",
			totalUsers: users.length,
		})
		
		// Відправити відповідь клієнту одразу
		res.json({
			broadcastId: broadcast._id,
			message: "Broadcast started",
			totalUsers: users.length,
		})
		
		// Асинхронно відправити розсилку всім користувачам
		;(async () => {
			try {
				let deliveredCount = 0
				let failedCount = 0
				const failedUserIds = []
				
				// Пакетна відправка для уникнення rate limits (по 30 повідомлень за раз)
				const batchSize = 30
				
				for (let i = 0; i < users.length; i += batchSize) {
					const batch = users.slice(i, i + batchSize)
					
					const sendPromises = batch.map(async (user) => {
						try {
							// Створюємо контекст, який відповідає структурі sendMessage функції
							const ctx = {
								chat: { id: user.chat_id },
								replyWithPhoto: async (fileId, options) => {
									return await bot.telegram.sendPhoto(user.chat_id, fileId, options)
								},
								replyWithVideo: async (fileId, options) => {
									return await bot.telegram.sendVideo(user.chat_id, fileId, options)
								},
								replyWithVoice: async (fileId, options) => {
									return await bot.telegram.sendVoice(user.chat_id, fileId, options)
								},
								replyWithHTML: async (text, options) => {
									return await bot.telegram.sendMessage(user.chat_id, text, {
										parse_mode: "HTML",
										...options,
									})
								},
							}
							
							// Викликати функцію sendMessage з контекстом користувача
							await sendMessage({
								ctx,
								image,
								video,
								audio,
								message,
								button: null,
								save: false,
							})
							
							deliveredCount++
						} catch (error) {
							console.error(`Failed to send to user ${user.chat_id}:`, error.message)
							failedCount++
							failedUserIds.push(user.chat_id)
						}
					})
					
					// Чекаємо завершення пакету перед наступним
					await Promise.all(sendPromises)
					
					// Затримка між пакетами для уникнення rate limits
					if (i + batchSize < users.length) {
						await new Promise((resolve) => setTimeout(resolve, 1000))
					}
				}
				
				// Оновити статус розсилки
				broadcast.status = "completed"
				broadcast.deliveredCount = deliveredCount
				broadcast.failedCount = failedCount
				broadcast.failedUserIds = failedUserIds
				await broadcast.save()
				
		} catch (error) {
				console.error("Broadcast error:", error)
				broadcast.status = "failed"
				await broadcast.save()
			}
		})()
	} catch (e) {
		console.error("Send broadcast error:", e)
		res.status(500).json({ message: "Server error" })
	}
}

module.exports = {
	sendBroadcast,
	getBroadcastHistory,
	getBroadcastStatus,
}
