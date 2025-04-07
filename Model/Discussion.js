const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    commentID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "comment"
    }],
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    dateTime: {
        type: Date,
        default: Date.now // Automatically stores current date & time
    },
    like: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    category: {
        type: String,
        enum: ["Producer", "Consumer", "Decomposer"],
        required: true
    }
});

const postModel = mongoose.model("post", postSchema);

module.exports = postModel;
