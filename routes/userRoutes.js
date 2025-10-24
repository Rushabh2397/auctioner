const express = require('express');
const userController = require('../controller/userController');
const userRouter = express.Router();

// Register User
// userRouter.post("/register", userController.adduser);

// User Login
// userRouter.post("/login", userController.login);

// Get User Details
// userRouter.post("/detail", userController.getUserDetail);

module.exports = userRouter;
