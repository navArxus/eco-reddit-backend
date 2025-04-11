const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    type: { type: String, enum: ['like', 'comment'], required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'post' },
    message: String,
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});


const postModel = mongoose.model("Notification", notificationSchema);
module.exports = postModel;