const mongoose = require('mongoose');

const messagesTemplate = new mongoose.Schema({
    message: { type: String, default: null },
    image:  { type: String, default: null },
    video:  { type: String, default: null },
    audio:  { type: String, default: null },
    command: {type: String, default: null },
    type: {type: String, enum:['button', 'message'], default: null },
});

messagesTemplate.index({ command: 1 }, { unique: true });

module.exports = mongoose.model('message_template', messagesTemplate);
