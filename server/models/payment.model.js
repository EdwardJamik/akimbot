const mongoose = require('mongoose');

const payment = new mongoose.Schema({
    chat_id: { type: Number, ref: 'user' },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
    mail:  { type: String, default: null },
    price:  { type: String, default: null },
    payment_id:  { type: String, default: null },
    card_holder: { type: String, default: null },
    payment_mail:  { type: String, default: null },
    status:  { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('payments', payment);
