const mongoose = require("mongoose")
const category = new mongoose.Schema({
    title: { type: String, default: null },
    message: { type: String, default: null },
    video: { type: String, default: null },
    image: { type: String, default: null },
    audio: { type: String, default: null },
    active: { type: Boolean, default: null },
    order: { type: Number, default: 0 },
})

category.index({ order: 1 })

module.exports = mongoose.model("category", category)