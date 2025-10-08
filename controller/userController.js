const userService = require("../services/userService");
const { sendSuccess, sendError } = require("../utils");


const addUser = async (req, res) => {
    try {
        const user = await userService.addUser(req.body);
        return sendSuccess(res, "User added successfully!", user)
    } catch (error) {
        if (error.code === "USER_EXISTS") {
            return sendError(res, 400, "User already exists.");
        }
        return sendError(res, 400, error.message || "Failed to add new user.", error)
    }
}

const login = async (req, res) => {
    try {
        const user = await userService.login(req.body);
        return sendSuccess(res, "User logged in successfully!", user)
    } catch (error) {
        if (error.code === "NOT_FOUND") {
            return sendError(res, 400, error.message || "please check email/password");
        }
        return sendError(res, 400, error.message || "Failed to login.", error)
    }
}



module.exports = {
    addUser,
    login
}