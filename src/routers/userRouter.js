const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = new express.Router();
const User = require("../models/userSchema");
const { auth } = require("../middleware/auth");

router.post("/sign-up", async (req, res) => {
    try {
        const newUser = await new User({ ...req.body });
        if (!newUser) {
            return res.send({ err: "Failed to create a new user" });
        }
        await newUser.save();
        res.send({ message: "User created" });
    } catch (err) {
        res.send({ err: "Email already exists" });
    }
})


router.post("/sign-in", async (req, res) => {
    try {
        console.log(req.body)
        const currentUser = await User.findOne({ email: req.body.email });
        console.log(currentUser)
        if (!currentUser) {
            return res.send({ err: "User doesn't exist" });
        }
        let isPassMatch = await bcrypt.compare(req.body.password, currentUser.password);
        console.log(isPassMatch)
        if (!isPassMatch) {
            return res.send({ err: "Password or email are invalid" });
        }
        const token = await currentUser.generateAuthToken();
        res.send({ token, email: currentUser.email, firstName: currentUser.firstName, lastName: currentUser.lastName });
    } catch (err) {
        res.send({ err: "Failed to log in" });
    }
})

router.post("/user-exists", async (req, res) => {
    try {
        const getUser = await User.findOne({ email: req.body.email })
        if (!getUser) {
            return res.send({ message: "False" });
        }
        res.send({ message: "True" });
    } catch (err) {
        res.send({ err: "False" })
    }
})

router.post("/verify-token", auth, async (req, res) => {
    try {
        res.send({ message: "Verified" })
    } catch (err) {
        res.send({ err: "Failed to verify" })
    }
})

router.post("/profile", auth, async(req, res)=>{
    try {
        console.log("going to send user")
        const user = {firstName: req.user.firstName, lastName: req.user.lastName, phone:req.user?.phone, email:req.user.email, ads: req.user.ads }
        res.send({user})
    } catch (error) {
        
    }
})



module.exports = router;