const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    chat_id: {
        type: Number,
        required: true,
        unique: true
    },
    username: {
        type: String,
        default: null
    },
    first_name: {
        type: String,
        default: null
    },
    last_name: {
        type: String,
        default: null
    },
    final_level: {
        type: String,
        enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
        default: null
    },
    test_completed: {
        type: Boolean,
        default: false
    },
    test_progress: {
        current_level: {
            type: String,
            enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
            default: null
        },
        current_question: {
            type: Number,
            default: 0
        },
        answers: {
            type: Object,
            default: {}
        },
        completed_levels: {
            type: [String],
            default: []
        }
    },
    last_message_id: {
        type: [Number],
        default: []
    },
    action: {
        type: String,
        default: ''
    },
    ban: {
        type: Boolean,
        default: false
    },
    is_user_ban: {
        type: Boolean,
        default: false
    },
    
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);