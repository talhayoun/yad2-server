const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ],
    ads: [
        {
            ad: {
                type: mongoose.Types.ObjectId
            }
        }
    ],
    bucket: {
        type: String
    }
});

userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    };
    next();
})

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign(
        {
            _id: user._id
        },
        process.env.SECRET_TOKEN,
        {
            expiresIn: "1h"
        }
    )
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

const User = mongoose.model("User", userSchema);
module.exports = User;