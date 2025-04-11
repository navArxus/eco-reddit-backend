const express = require('express')
const router = express.Router()
const notificationModel = require("../../Model/Notification")

router.get('/', async (req, res) => {
    const userId = req.user;

    try {
        const notifications = await notificationModel.find({ recipient: userId, isRead: false })
            .sort({ createdAt: -1 })
            .populate('sender', 'name') // get sender's name 
            .exec();

        res.status(200).json({ notifications });
    } catch (err) {
        res.status(200).json({ message: 'Failed to fetch notifications', error: err.message });
    }
});

router.post('/mark-read', async (req, res) => {
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds) ) {
        return res.status(200).json({ message: 'notificationIds array is required' });
    }

    try {
        await notificationModel.updateMany(
            { _id: { $in: notificationIds } },
            { $set: { isRead: true } }
        );

        res.status(200).json({ message: 'Notifications marked as read' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating notifications', error: err.message });
    }
});



module.exports = router