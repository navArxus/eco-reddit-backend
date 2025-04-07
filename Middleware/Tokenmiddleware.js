const { VerifyToken } = require("../Services/Token")
const userModal = require("../Model/User")
const tokenValidator = async (req, res, next) => {
    console.log("Middleware runs")
    const responce = VerifyToken(req.cookies.token)
    if (!responce) {
        return res.json({
            status: false,
            message: "Unauthroized",
            loginIssue: true
        })
    }
    else {
        const user = await userModal.findOne({ email: responce.email })
        if (!user) return res.json({
            status: false,
            message: "Unauthroized user",
            loginIssue: true
        })
        req.user = user._id
        next()
    }
}

module.exports = tokenValidator