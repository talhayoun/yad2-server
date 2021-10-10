const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

const auth = async function (req, res, next) {
    try {
        let token = req.headers.token
        const isVerified = jwt.verify(token, process.env.SECRET_TOKEN);
        // console.log(isVerified)
        if (!isVerified) {
            return res.send({ err: "Failed to verify token" });
        }
        const findUser = await User.findOne({
            _id: isVerified._id,
            "tokens.token": token
        })
        if (!findUser) {
            return res.send({ err: "Failed to find user with that token" });
        }
        // console.log(findUser)
        req.user = findUser;
        req.token = token;
        console.log("bla")
        next();
    } catch (error) {
        res.status(404).send({ err: "Failed to verify auth" })
    }
}

module.exports = { auth }