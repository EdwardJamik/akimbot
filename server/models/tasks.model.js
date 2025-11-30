const mongoose = require("mongoose")

const tasks = new mongoose.Schema({
    question: { type: String, default: null },
    image: { type: String, default: null },
    video: { type: String, default: null },
    audio: { type: String, default: null },
    answers: { type: Array, default: null },
    correct_answer: { type: Number, default: null },
    type: { type: String, enum: ["A1", "A2", "B1", "B2", "C1", "C2"], default: null },
    question_position: { type: Number, default: null },
    recommended_course_id: { type: mongoose.Schema.Types.ObjectId, ref: "category", default: null },
    createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("tasks", tasks)
