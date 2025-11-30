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

const getUserCount = async (req, res) => {
	try {
		const usersList = await User.countDocuments()
		
		res.json(usersList)
	} catch (e) {
		console.error("Get users error:", e)
		res.status(500).json({ message: "Server error" })
	}
}

const getMessages = async (req, res) => {
	try {
		const messageList = await MessageTemplate.find().sort({ type: 1 })
		res.json(messageList)
	} catch (e) {
		console.error("Get users error:", e)
		res.status(500).json({ message: "Server error" })
	}
}

const blockUser = async (req, res) => {
	try {
		const { userId } = req.body
		
		if (!userId) {
			return res.status(400).json({ message: "userId is required" })
		}
		
		const user = await User.findById(userId)
		
		if (!user) {
			return res.status(404).json({ message: "User not found" })
		}
		
		user.ban = !user.ban
		
		await user.save()
		
		res.json({
			message: user.ban ? "User blocked" : "User unblocked",
			ban: user.ban,
		})
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: "Server error" })
	}
}

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

const updateMessageTemplate = async (req, res) => {
	try {
		const { id, message, type, command, removeMedia } = req.body
		if (!id) return res.status(400).json({ message: "id is required" })
		
		const doc = await MessageTemplate.findById(id)
		if (!doc) return res.status(404).json({ message: "Template not found" })
		
		const fileImage = req.files?.image?.[0] || null
		const fileVideo = req.files?.video?.[0] || null
		const fileAudio = req.files?.audio?.[0] || null
		
		let imageId = null
		let videoId = null
		let audioId = null
		
		if (fileImage) imageId = await sendMediaToTelegram(fileImage, "image")
		if (fileVideo) videoId = await sendMediaToTelegram(fileVideo, "video")
		if (fileAudio) audioId = await sendMediaToTelegram(fileAudio, "audio")
		
		if (message !== undefined) doc.message = message
		if (type !== undefined) doc.type = type
		if (command !== undefined) doc.command = command
		
		if (removeMedia === "true") {
			doc.image = null
			doc.video = null
			doc.audio = null
		}
		
		if (imageId) doc.image = imageId
		if (videoId) doc.video = videoId
		if (audioId) doc.audio = audioId
		
		if (imageId || videoId || audioId) {
			if (!imageId) doc.image = null
			if (!videoId) doc.video = null
			if (!audioId) doc.audio = null
		}
		
		await doc.save()
		
		res.json({ message: "Updated successfully", template: doc })
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: "Server error" })
	}
}

// --- КАТЕГОРІЇ ---
const getCategories = async (req, res) => {
	try {
		const categories = await Category.find().sort({ order: 1 })
		res.json(categories)
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: "Server error" })
	}
}

const createOrUpdateCategory = async (req, res) => {
	try {
		const { id, title, message, active, removeMedia  } = req.body
		const fileImage = req.files?.image?.[0] || null
		const fileVideo = req.files?.video?.[0] || null
		const fileAudio = req.files?.audio?.[0] || null
	
		let image = null,
			video = null,
			audio = null
		
		if (fileImage) image = await sendMediaToTelegram(fileImage, "image")
		if (fileVideo) video = await sendMediaToTelegram(fileVideo, "video")
		if (fileAudio) audio = await sendMediaToTelegram(fileAudio, "audio")
		
		let category
		if (id) {
			category = await Category.findById(id)
			if (!category) return res.status(404).json({ message: "Category not found" })
			
			category.title = title ?? category.title
			category.message = message ?? category.message
			category.active = active ?? category.active
			
			category.image = removeMedia ? null : image ?? category.image
			category.video = removeMedia ? null : video ?? category.video
			category.audio = removeMedia ? null : audio ?? category.audio
			
			await category.save()
		} else {
			const lastCategory = await Category.findOne().sort({ order: -1 })
			const nextOrder = (lastCategory?.order || 0) + 1
			
			category = await Category.create({
				title,
				message,
				active: active ?? true,
				image,
				video,
				audio,
				order: nextOrder,
			})
		}
		
		res.json({ message: "Success", category })
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: "Server error" })
	}
}

const deleteCategory = async (req, res) => {
	try {
		const { id } = req.params
		const deletedCategory = await Category.findByIdAndDelete(id)
		
		if (deletedCategory) {
			const categories = await Category.find().sort({ order: 1 })
			for (let i = 0; i < categories.length; i++) {
				categories[i].order = i
				await categories[i].save()
			}
		}
		
		await Courses.deleteMany({ categoryId: id })
		res.json({ message: "Category deleted" })
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: "Server error" })
	}
}

const updateCategoryOrder = async (req, res) => {
	try {
		const { categories } = req.body
		
		if (!Array.isArray(categories)) {
			return res.status(400).json({ message: "categories must be an array" })
		}
		
		// Update each category with its new order
		const updatePromises = categories.map((cat, index) =>
			Category.findByIdAndUpdate(cat._id, { order: index }, { new: true }),
		)
		
		const updatedCategories = await Promise.all(updatePromises)
		res.json({ message: "Order updated successfully", categories: updatedCategories })
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: "Server error" })
	}
}

// --- КУРСИ ---
const getCourses = async (req, res) => {
	try {
		const { categoryId } = req.params
		if (categoryId) {
			const courses = await Courses.find({ categoryId })
			res.json(courses)
		} else {
			const courses = await Courses.find({})
			res.json(courses)
		}
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: "Server error" })
	}
}

const createOrUpdateCourse = async (req, res) => {
	try {
		const { id, title, message, price, categoryId, option } = req.body
		const fileImage = req.files?.image?.[0] || null
		const fileVideo = req.files?.video?.[0] || null
		const fileAudio = req.files?.audio?.[0] || null
		
		const fileOptionImage = req.files?.optionImage?.[0] || null
		const fileOptionVideo = req.files?.optionVideo?.[0] || null
		const fileOptionAudio = req.files?.optionAudio?.[0] || null
		
		let image = null,
			video = null,
			audio = null
		let optionImage = null,
			optionVideo = null,
			optionAudio = null
		
		if (fileImage) image = await sendMediaToTelegram(fileImage, "image")
		if (fileVideo) video = await sendMediaToTelegram(fileVideo, "video")
		if (fileAudio) audio = await sendMediaToTelegram(fileAudio, "audio")
		
		if (fileOptionImage) optionImage = await sendMediaToTelegram(fileOptionImage, "image")
		if (fileOptionVideo) optionVideo = await sendMediaToTelegram(fileOptionVideo, "video")
		if (fileOptionAudio) optionAudio = await sendMediaToTelegram(fileOptionAudio, "audio")
		
		const parsedOption = option ? JSON.parse(option) : []
		
		// Get all optionMedia files from multer (optionMedia_0_image, optionMedia_1_video, etc.)
		for (let i = 0; i < parsedOption.length; i++) {
			const optionImageFile = req.files?.[`optionMedia_${i}_image`]?.[0] || null
			const optionVideoFile = req.files?.[`optionMedia_${i}_video`]?.[0] || null
			const optionAudioFile = req.files?.[`optionMedia_${i}_audio`]?.[0] || null
			
			if (optionImageFile) {
				parsedOption[i].image = await sendMediaToTelegram(optionImageFile, "image")
			}
			if (optionVideoFile) {
				parsedOption[i].video = await sendMediaToTelegram(optionVideoFile, "video")
			}
			if (optionAudioFile) {
				parsedOption[i].audio = await sendMediaToTelegram(optionAudioFile, "audio")
			}
		}
		
		let course
		if (id) {
			course = await Courses.findById(id)
			if (!course) return res.status(404).json({ message: "Course not found" })
			
			course.title = title ?? course.title
			course.message = message ?? course.message
			course.price = price ?? course.price
			course.categoryId = categoryId ?? course.categoryId
			course.option = parsedOption
			
			course.image = image ?? course.image
			course.video = video ?? course.video
			course.audio = audio ?? course.audio
			
			await course.save()
		} else {
			course = await Courses.create({
				title,
				message,
				price,
				categoryId,
				option: parsedOption,
				image,
				video,
				audio,
			})
		}
		
		res.json({ message: "Success", course })
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: "Server error" })
	}
}

const deleteCourse = async (req, res) => {
	try {
		const { id } = req.params
		await Courses.findByIdAndDelete(id)
		res.json({ message: "Course deleted" })
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: "Server error" })
	}
}

const taskRecommend = async (req, res) => {
	try {
		const { tasks, id } = req.body
		
		if (!Array.isArray(tasks)) {
			return res.status(400).json({ message: "tasks must be an array" })
		}
		const recommended_course_id = id === 'none' ? null : id
		
		const updatePromises = tasks.map(async (task) =>
			await Tasks.findByIdAndUpdate({_id: task._id}, {recommended_course_id}, {new: true}),
		)
		
		const updatedTasks = await Promise.all(updatePromises)
		res.json({ message: "Order updated successfully", tasks: updatedTasks })
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: "Server error" })
	}
}

// --- ТЕСТУВАННЯ (TASKS) ---
const getTasks = async (req, res) => {
	try {
		const { type } = req.query
		const query = {}
		if (type) {
			query.type = type
		}
		const tasks = await Tasks.find(query).sort({ type: 1, question_position: 1 })
		res.json(tasks)
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: "Server error" })
	}
}

const createOrUpdateTask = async (req, res) => {
	try {
		const { id, question, answers, correct_answer, type, question_position, recommended_course_id, removeMedia } = req.body
		const fileImage = req.files?.image?.[0] || null
		const fileVideo = req.files?.video?.[0] || null
		const fileAudio = req.files?.audio?.[0] || null
		
		let image = null,
			video = null,
			audio = null
		
		if (fileImage) image = await sendMediaToTelegram(fileImage, "image")
		if (fileVideo) video = await sendMediaToTelegram(fileVideo, "video")
		if (fileAudio) audio = await sendMediaToTelegram(fileAudio, "audio")
		
		const parsedAnswers = typeof answers === "string" ? JSON.parse(answers) : answers
		
		let task
		if (id) {
			task = await Tasks.findById(id)
			if (!task) return res.status(404).json({ message: "Task not found" })
			
			task.question = question ?? task.question
			task.answers = parsedAnswers ?? task.answers
			task.correct_answer = correct_answer ?? task.correct_answer
			task.type = type ?? task.type
			task.question_position = question_position ?? task.question_position
			task.recommended_course_id = recommended_course_id || null
			
				task.image = removeMedia === 'true' ? null : image ?? task.image
				task.video = removeMedia === 'true' ? null : video ?? task.video
				task.audio = removeMedia === 'true' ? null : audio ?? task.audio

			await task.save()
		} else {
			task = await Tasks.create({
				question,
				answers: parsedAnswers,
				correct_answer,
				type,
				question_position,
				recommended_course_id: recommended_course_id || null,
				image,
				video,
				audio,
			})
		}
		
		res.json({ message: "Success", task })
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: "Server error" })
	}
}

const deleteTask = async (req, res) => {
	try {
		const { id } = req.params
		await Tasks.findByIdAndDelete(id)
		res.json({ message: "Task deleted" })
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: "Server error" })
	}
}

const updateTaskOrder = async (req, res) => {
	try {
		const { tasks } = req.body
		
		if (!Array.isArray(tasks)) {
			return res.status(400).json({ message: "tasks must be an array" })
		}
		
		const updatePromises = tasks.map(async (task, index) =>
			await Tasks.findByIdAndUpdate({_id: task.id}, {question_position: task.question_position}, {new: true}),
		)
		
		const updatedTasks = await Promise.all(updatePromises)
		res.json({ message: "Order updated successfully", tasks: updatedTasks })
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: "Server error" })
	}
}

module.exports = {
	getUsers,
	blockUser,
	getMessages,
	updateMessageTemplate,
	getCategories,
	createOrUpdateCategory,
	deleteCategory,
	updateCategoryOrder,
	getCourses,
	createOrUpdateCourse,
	deleteCourse,
	getTasks,
	createOrUpdateTask,
	deleteTask,
	updateTaskOrder,
	taskRecommend,
	getUserCount
}
