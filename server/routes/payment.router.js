const { Router } = require("express")
const checkAdmin = require("../middlewares/checkAdmin")
const multer = require("multer")
const {
	getUsers,
} = require("../controllers/admin.controller")
const { resultPayment } = require("../controllers/payment.controller")
const express = require('express')

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

router.get("/getUsers", checkAdmin, getUsers)


module.exports = router
