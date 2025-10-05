const User = require("../models/user")
const { decrypt, encrypt } = require('../utils/encryDecry')

module.exports = {

    adduser: async (req, res) => {
        try {
            const { name, email, password, tournamnetHostId } = req.body
            const newUser = new User({
                name,
                email,
                password,
                tournamnetHostId
            })

            const saveduser = newUser.save(newUser);
            return res.status(201).json({
                messsge: "User addded successfully",
                data: saveduser
            });
        } catch (error) {
            console.log("Error while creating new user", error);
            return res.status(400).json({
                message: (error && error.message) || 'Oops! Failed to add new user.'
            })
        }

    },
    login: async (req, res) => {
        try {
            const user = await User.findOne({ email: req.body.email });
            if (!user) {
                return res.status(400).json({ message: "User not found" });
            }
            console.log("user", user)
            console.log("REQ", req.body)

            let passwordMatched = decrypt(req.body.password, user.password)
            if (!passwordMatched) {
                return res.status(400).json({ message: "Please check your email/password" });
            }
            return res.status(200).json({
                message: "User logged in successfully",
                data: {
                    name: user.name,
                    email: user.email,
                    tournamnetHostId: user.tournamnetHostId
                }
            })
        } catch (error) {
            console.log("Error while  logging user", error);
            return res.status(400).json({
                message: (error && error.message) || 'Oops! Failed to login user.'
            })
        }
    }
}