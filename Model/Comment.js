const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    postID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    dateTime: {
        type: Date,
        default: Date.now
    }
});

const commentModel = mongoose.model("comment", commentSchema);

module.exports = commentModel;
