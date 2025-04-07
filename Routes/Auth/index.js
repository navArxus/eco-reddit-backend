const express = require("express")
const router = express.Router()
const userModel = require("../../Model/User")
const { GenerateToken } = require("../../Services/Token")
const bcrypt = require("bcrypt")


router.post("/register", async (req, res) => {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
        res.json({
            status: false,
            message: "Please fill all fields"
        })
    } else {
        const alreadyUser = await userModel.findOne({ email: email })
        if (alreadyUser) {
            res.json({
                status: false,
                message: "Email already exists"
            })
        }
        const user = await userModel.create({ name, email, password })
        const token = GenerateToken(user.email)
        res.cookie('token', token, { httpOnly: true, path: "/" })
        res.json({ status: true, message: "Register Successfully" })
    }
})

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

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
            path: "/"
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












module.exports = router;