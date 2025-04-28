const express = require('express')
const app = express()
require('dotenv').config()
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookiePraser = require("cookie-parser")
const cros = require('cors')
// Routes 
const userRoutes = require("./Routes/Auth/index")
const discussionRoutes = require("./Routes/Discussion/index")
const commentRoutes = require("./Routes/Comment/index")
const feedRoute = require("./Routes/Discussion/feed")
const notificationRoute = require("./Routes/Discussion/notification")
const profileRoute = require("./Routes/Profile/index")

// Middleware
const tokenValidator = require("./Middleware/Tokenmiddleware")

// Mongoose connection 
mongoose.connect(process.env.MONGO_URL).then(console.log("connected to mongodb")).catch(err => console.log(err))

// System Middleware
app.use(cros({
    origin: ["http://localhost:5173","https://eco-reddit.vercel.app"],
    credentials: true
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookiePraser())
app.use(express.json());

app.get("/", tokenValidator, (req, res) => {
    console.log("hello world")
    console.log(req.cookies)
    res.json({
        status: true,
        message: "Request reviced"
    })
})
app.use("/auth", userRoutes)
app.get("/route-verify", tokenValidator, (req, res) => {
    res.json({ status: true, authenticated: true })
})
app.use("/discussion", tokenValidator, discussionRoutes)
app.use("/comment", tokenValidator, commentRoutes)
app.use("/getDiscussion", tokenValidator, feedRoute)
app.use("/notification", tokenValidator, notificationRoute)
app.use("/profile", tokenValidator, profileRoute)

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})