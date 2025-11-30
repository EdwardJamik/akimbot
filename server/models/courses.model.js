const mongoose = require('mongoose');

const courses = new mongoose.Schema({
    title: { type: String, default: null },
    message:  { type: String, default: null },
    image:  { type: String, default: null },
    video:  { type: String, default: null },
    audio:  { type: String, default: null },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
    price:  { type: Number, default: 0 },
    option: [{
        message: { type: String, default: null },
        image: { type: String, default: null },
        video: { type: String, default: null },
        audio: { type: String, default: null },
        main: { type: Boolean, default: false },
        title: { type: String, default: null }
    }]
}, { timestamps: true });

module.exports = mongoose.model('courses', courses);
