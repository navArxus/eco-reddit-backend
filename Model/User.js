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
    }]
})

userSchema.pre('save', async function () {
    const hashPassword = await bcrypt.hash(this.password, 10)
    this.password = hashPassword
})
userSchema.static('matchPassword', async (email, password) => {
    const user = await this.findOne({ email: email })
    if (!user) return false
    const result = await bcrypt.compare(password, user.password)
    return result
})

const userModel = mongoose.model('user', userSchema)

module.exports = userModel
