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
	updateTaskOrder, taskRecommend, getUserCount,
} = require("../controllers/admin.controller")

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

router.get("/getUsers", checkAdmin, getUsers)
router.post("/blockUser", checkAdmin, blockUser)
router.get("/getMessages", checkAdmin, getMessages)
router.post(
	"/updateMessageTemplate",
	checkAdmin,
	upload.fields([
		{ name: "image", maxCount: 1 },
		{ name: "video", maxCount: 1 },
		{ name: "audio", maxCount: 1 },
	]),
	updateMessageTemplate,
)

router.get("/categories", checkAdmin, getCategories)
router.post(
	"/category",
	checkAdmin,
	upload.fields([
		{ name: "image", maxCount: 1 },
		{ name: "video", maxCount: 1 },
		{ name: "audio", maxCount: 1 },
	]),
	createOrUpdateCategory,
)
router.post("/categories/update-order", checkAdmin, updateCategoryOrder)
router.delete("/category/:id", checkAdmin, deleteCategory)

router.get("/courses/:categoryId", checkAdmin, getCourses)
router.get("/courses", checkAdmin, getCourses)

const optionMediaFields = []
for (let i = 0; i < 50; i++) {
	optionMediaFields.push({ name: `optionMedia_${i}_image`, maxCount: 1 })
	optionMediaFields.push({ name: `optionMedia_${i}_video`, maxCount: 1 })
	optionMediaFields.push({ name: `optionMedia_${i}_audio`, maxCount: 1 })
}

router.post(
	"/course",
	checkAdmin,
	upload.fields([
		{ name: "image", maxCount: 1 },
		{ name: "video", maxCount: 1 },
		{ name: "audio", maxCount: 1 },
		...optionMediaFields,
	]),
	createOrUpdateCourse,
)
router.delete("/course/:id", checkAdmin, deleteCourse)

router.get("/tasks", checkAdmin, getTasks)
router.get("/getUserCount", checkAdmin, getUserCount)
router.post(
	"/task",
	checkAdmin,
	upload.fields([
		{ name: "image", maxCount: 1 },
		{ name: "video", maxCount: 1 },
		{ name: "audio", maxCount: 1 },
	]),
	createOrUpdateTask,
)
router.post(
	"/task-recommend",
	checkAdmin,
	taskRecommend,
)
router.post("/tasks/update-order", checkAdmin, updateTaskOrder)
router.delete("/task/:id", checkAdmin, deleteTask)

module.exports = router
