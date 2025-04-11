const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const userSchema = mongoose.Schema({
    name: {
        required: true,
        type: String,
    },
    email: {
        required: true,
        type: String,
        unique: true
    },
    password: {
        required: true,
        type: String,
    },
    like: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "post"
    }],
    savedDiscussions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'post' }]
})


userSchema.static('matchPassword', async (email, password) => {
    const user = await this.findOne({ email: email })
    if (!user) return false
    const result = await bcrypt.compare(password, user.password)
    return result
})

const userModel = mongoose.model('user', userSchema)

module.exports = userModel
