const { Router } = require("express")
const checkAdmin = require("../middlewares/checkAdmin")
const multer = require("multer")
const { sendBroadcast, getBroadcastHistory, getBroadcastStatus } = require("../controllers/broadcast.controller")

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

// GET маршрути
router.get("/history", checkAdmin, getBroadcastHistory)
router.get("/status/:broadcastId", checkAdmin, getBroadcastStatus)

// POST маршрути
router.post(
	"/send",
	checkAdmin,
	upload.fields([
		{ name: "image", maxCount: 1 },
		{ name: "video", maxCount: 1 },
		{ name: "audio", maxCount: 1 },
	]),
	sendBroadcast,
)

module.exports = router
