const { Router } = require("express")
const checkAdmin = require("../middlewares/checkAdmin")
const multer = require("multer")
const {
	getUsers,
	blockUser,
	getMessages,
	updateMessageTemplate,
	getCategories,
	deleteCategory,
	getCourses,
	createOrUpdateCategory,
	deleteCourse,
	createOrUpdateCourse,
	updateCategoryOrder,
	getTasks,
	createOrUpdateTask,
	deleteTask,
	updateTaskOrder, taskRecommend,
} = require("../controllers/admin.controller")

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

router.get("/getUsers", checkAdmin, getUsers)


module.exports = router
