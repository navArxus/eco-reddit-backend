const router = require("express").Router()

const userModel = require("../../Model/User")

router.get("/",async (req,res) => {
    const user = await userModel.findById(req.user);
    res.json({
        status:true,
        data: {
            name:user.name,
            email:user.email,
        }
    })
    
})

module.exports = router