const mongoose = require("mongoose");
const bcrypt = require("bcrypt")
const otpSchema = mongoose.Schema({
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
    otp: {
        required: true,
        type: Number,
    },
    expiresAt: {
        type: Date,
        required: true,
    }
});
otpSchema.pre('save', async function () {
    const hashPassword = await bcrypt.hash(this.password, 10)
    this.password = hashPassword
})

const otpModel = mongoose.model("otp", otpSchema);

module.exports = otpModel;
