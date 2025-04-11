const JWT = require('jsonwebtoken');

const GenerateToken = (email) => {
    if (!email) {
        return "Error : Invaild argument to generate token";
    } else {
        const token = JWT.sign({ email: email }, process.env.SECRET_KEY)
        return token;
    }
}

const VerifyToken = (token) => {
    if (!token) {
        return "Error : Invaild argument to verify token";
    } else {
        const data = JWT.verify(token, process.env.SECRET_KEY)
        return data;
    }
}

module.exports = {
    GenerateToken,
    VerifyToken
}