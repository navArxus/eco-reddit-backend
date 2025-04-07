const express = require("express");
const router = express.Router();

const commentModel = require("../../Model/Comment");
const postModel = require("../../Model/Discussion");

router.post("/create", async (req, res) => {
    const {  postID, text } = req.body;
    const userID = req.user
    if (!userID || !postID || !text) {
        return res.status(400).json({
            status: false,
            message: "Please provide userID, postID, and text"
        });
    }

    try {
        // Create the comment
        const newComment = await commentModel.create({
            userID,
            postID,
            content:text
        });

        // Add comment ID to post's commentID array
        await postModel.findByIdAndUpdate(postID, {
            $push: { commentID: newComment._id }
        });

        return res.status(201).json({
            status: true,
            message: "Comment added successfully",
            comment: newComment
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Server error while creating comment",
            error: error.message
        });
    }
});
router.delete("/:id", async (req, res) => {
    const { id: commentID } = req.params;

    try {
        const comment = await commentModel.findById(commentID);
        if (!comment) {
            return res.status(404).json({
                status: false,
                message: "Comment not found"
            });
        }

        // Remove the comment reference from its post
        await postModel.findByIdAndUpdate(comment.postID, {
            $pull: { commentID: commentID }
        });

        // Delete the comment itself
        await commentModel.findByIdAndDelete(commentID);

        return res.status(200).json({
            status: true,
            message: "Comment deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Server error while deleting comment",
            error: error.message
        });
    }
});

module.exports = router;