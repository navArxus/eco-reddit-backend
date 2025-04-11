const express = require("express");
const router = express.Router();
const discussionModel = require("../../Model/Discussion")
const userModel = require("../../Model/User")
const notificationModel = require("../../Model/Notification")

router.post("/create", async (req, res) => {
    const { discussion, category } = req.body;
    console.log(req.user, discussion, category)
    const userID = req.user
    if (!userID || !discussion || !category) {
        return res.status(400).json({
            status: false,
            message: "Please provide all required fields: userID, title, and description"
        });
    }

    try {
        const newDiscussion = await discussionModel.create({
            userID,
            discussion,
            category
            // dateTime will auto-generate
        });

        return res.status(201).json({
            status: true,
            message: "Discussion created successfully",
            discussion: newDiscussion
        });
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Server error while creating discussion",
            error: err.message
        });
    }
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const deletedPost = await discussionModel.findByIdAndDelete(id);

        if (!deletedPost) {
            return res.status(404).json({
                status: false,
                message: "Discussion not found"
            });
        }

        return res.status(200).json({
            status: true,
            message: "Discussion deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Server error while deleting discussion",
            error: error.message
        });
    }
});

router.post("/like/:id", async (req, res) => {
    const userID = req.user;
    const postID = req.params.id;
    console.log("Params", req.params)
    console.log("User", userID)
    try {
        const post = await discussionModel.findById(postID);
        const user = await userModel.findById(userID);
        console.log("POST", post)
        console.log("USER", user)
        if (!post || !user) {
            return res.status(404).json({ status: false, message: "Post or user not found" });
        }

        const hasLikedPost = post.like.includes(userID);

        if (hasLikedPost) {
            // Unlike: remove user from post.like and post from user.like
            post.like.pull(userID);
            user.like.pull(postID);
            await post.save();
            await user.save();
            return res.json({ status: true, message: "Post unliked" });
        } else {
            // Like: add user to post.like and post to user.like
            post.like.push(userID);
            user.like.push(postID);
            await post.save();
            await user.save();
            const author = await userModel.findById(post.userID) 
            await notificationModel.create({
                recipient: post.userID,
                sender: req.user,
                type: 'like',
                post: postID,
                message: `${user.name} liked your post.`
            });

            return res.json({ status: true, message: "Post liked" });
        }

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Server error while liking/unliking post",
            error: error.message
        });
    }
});

module.exports = router;