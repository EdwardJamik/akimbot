const mongoose = require("mongoose")

const broadcastSchema = new mongoose.Schema(
	{
		message: {
			type: String,
			required: true,
		},
		image: {
			type: String,
			default: null,
		},
		video: {
			type: String,
			default: null,
		},
		audio: {
			type: String,
			default: null,
		},
		sentAt: {
			type: Date,
			default: Date.now,
		},
		totalUsers: {
			type: Number,
			default: 0,
		},
		deliveredCount: {
			type: Number,
			default: 0,
		},
		failedCount: {
			type: Number,
			default: 0,
		},
		status: {
			type: String,
			enum: ["pending", "sending", "completed", "failed"],
			default: "pending",
		},
		failedUserIds: {
			type: [Number],
			default: [],
		},
	},
	{
		timestamps: true,
	},
)

const Broadcast = mongoose.model("Broadcast", broadcastSchema)
module.exports = Broadcast
