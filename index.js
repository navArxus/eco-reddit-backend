const express = require('express')
const app = express()
require('dotenv').config()
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookiePraser = require("cookie-parser")

// Routes 
const userRoutes = require("./Routes/Auth/index")
const discussionRoutes = require("./Routes/Discussion/index")
const commentRoutes = require("./Routes/Comment/index")

// Middleware
const tokenValidator = require("./Middleware/Tokenmiddleware")

// Mongoose connection 
mongoose.connect(process.env.MONGO_URL).then(console.log("connected to mongodb")).catch(err => console.log(err))

// System Middleware
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
app.use("/discussion", tokenValidator, discussionRoutes)
app.use("/comment", tokenValidator, commentRoutes)

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})