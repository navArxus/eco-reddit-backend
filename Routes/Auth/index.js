const express = require("express")
const router = express.Router()
const userModel = require("../../Model/User")
const otpModel = require("../../Model/Otp")
const { GenerateToken } = require("../../Services/Token")
const bcrypt = require("bcrypt")
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'sharearxus@gmail.com',
        pass: process.env.EMAIL_PASSWORD, // use App Password if using Gmail
    },
});

router.post("/register", async (req, res) => {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
        res.json({
            status: false,
            message: "Please fill all fields"
        })
    } else {
        const alreadyUser = await userModel.findOne({ email: email })
        await otpModel.deleteOne({ email: email })
        if (alreadyUser) {
            return res.json({
                status: false,
                message: "Email already exists"
            })
        }



        const otp = Math.floor(100000 + Math.random() * 900000);
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

        const user = await otpModel.create({ name, email, password, otp, expiresAt })

        try {
            await transporter.sendMail({
                from: 'sharearxus@gmail.com',
                to: user.email,
                subject: 'Your OTP Code',
                text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
            });

            res.json({ status: true, message: 'OTP sent successfully' });
        } catch (err) {
            res.status(500).json({ status: false, message: 'Failed to send email' });
        }

    }
})

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log("request recived")
    // Check if fields are empty
    if (!email || !password) {
        return res.json({
            status: false,
            message: "Please fill all fields"
        });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({
                status: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({
                status: false,
                message: "Invalid email or password"
            });
        }

        const token = GenerateToken(user.email);
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/'
        });

        return res.json({
            status: true,
            message: "Login Successful"
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Server Error",
            error: error.message
        });
    }
});


router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    const record = await otpModel.findOne({ email: email })
    console.log("request recived", email, otp)
    if (!record) {
        return res.status(400).json({ error: 'No OTP sent to this email' });
    }

    if (Date.now() > record.expiresAt) {
        return res.status(400).json({ error: 'OTP expired' });
    }

    if (Number(record.otp) == Number(otp)) {
        const user = await userModel.create({ name: record.name, email: record.email, password: record.password })
        await otpModel.deleteOne({ email: email })
        const token = GenerateToken(user.email)
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/'
        })
        return res.json({ status: true, message: "Register Successfully" })
    } else {
        return res.status(400).json({ error: 'Invalid OTP' });
    }
});










module.exports = router;