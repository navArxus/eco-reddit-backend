const express = require('express')
const router = express.Router()
const discussionModel = require("../../Model/Discussion")
const mongoose = require('mongoose');
const userModel = require('../../Model/User');

router.post("/", async (req, res) => {
    const limit = parseInt(req.body.limit) || 10;
    const exclude = req.body.exclude ? req.body.exclude : [];

    const remainingCount = await discussionModel.countDocuments({
        _id: { $nin: exclude.map(id => new mongoose.Types.ObjectId(id)) },
    });

    if (remainingCount === 0) {
        return res.json([]);
    }

    const sampleSize = Math.min(limit, remainingCount);

    const pipeline = [
        { $match: { _id: { $nin: exclude.map(id => new mongoose.Types.ObjectId(id)) } } },
        { $sample: { size: sampleSize } } // Randomly sample
    ];
    const discussions = await discussionModel.aggregate(pipeline).exec();
    const populatedDiscussions = await discussionModel.populate(discussions, { path: "userID", select: "name" });

    const finalDiscussions = populatedDiscussions.map(discuss => ({
        ...discuss,
        username: discuss.userID.name, // userID now contains the full user object
        isLiked: discuss.like.map(like => like.toString()).includes(req.user.toString())
    }));
    console.log(finalDiscussions)
    return res.json(finalDiscussions);
})

router.get('/trending', async (req, res) => {
    try {
        const trendingPosts = await discussionModel.aggregate([
            {
                $addFields: {
                    likesCount: { $size: { $ifNull: ["$likes", []] } },
                    commentsCount: { $size: { $ifNull: ["$comments", []] } },
                }
            },
            {
                $addFields: {
                    popularityScore: {
                        $add: [
                            { $multiply: ["$likesCount", 2] },     // likes have weight 2
                            { $multiply: ["$commentsCount", 1] }   // comments have weight 1
                        ]
                    }
                }
            },
            { $sort: { popularityScore: -1 } },
            { $limit: 4 }
        ]);

        res.status(200).json({ trending: trendingPosts });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching trending discussions', error: err.message });
    }
});

router.post("/details", async (req, res) => {
    try {
        const postID = req.body.discussionId;
        const userID = req.user; // Assuming user ID from auth middleware

        const post = await discussionModel.findById(postID)
            .populate({
                path: "userID",
                select: "username name _id"
            })
            .populate({
                path: "commentID",
                populate: {
                    path: "userID",
                    select: "username name _id"
                }
            })
            .lean(); // Makes the result plain JS object

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const likeCount = post.like.length;
        const likedByUser = post.like.includes(userID.toString());

        const response = {
            _id: post._id,
            discussion: post.discussion,
            category: post.category,
            author: {
                _id: post.userID._id,
                username: post.userID.name, // assuming `name` is used as username
            },
            likeCount,
            likedByUser,
            comments: post.commentID.map(comment => ({
                _id: comment._id,
                content: comment.content,
                dateTime: comment.dateTime,
                user: {
                    _id: comment.userID._id,
                    username: comment.userID.name
                }
            }))
        };

        res.status(200).json(response);

    } catch (error) {
        console.error("Error fetching discussion:", error);
        res.status(500).json({ message: "Server error" });
    }
})

router.post('/save-discussion', async (req, res) => {
    const { postId } = req.body;
    const userId = req.user

    if (!userId || !postId) {
        return res.status(400).json({ message: 'userId and postId are required' });
    }

    try {
        // Optional: Check if the post exists
        // const postExists = await Post.findById(postId);
        // if (!postExists) return res.status(404).json({ message: 'Post not found' });

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Avoid duplicates
        if (!user.savedDiscussions.includes(postId)) {
            user.savedDiscussions.push(postId);
            await user.save();
        }

        res.status(200).json({ message: 'Discussion saved', savedDiscussions: user.savedDiscussions });
    } catch (err) {
        res.status(200).json({ message: 'Server error', error: err.message });
    }
});

router.get('/get-saved-discussions', async (req, res) => {
    const userId = req.user;

    try {
        const user = await userModel.findById(userId)
            .populate({
                path: 'savedDiscussions',
                populate: {
                    path: 'userID',
                    select: 'name', // only get the username of the author
                }
            })
            .exec();

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ savedDiscussions: user.savedDiscussions });
    } catch (err) {
        res.status(200).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;