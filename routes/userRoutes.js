const express = require('express');
const userController = require('../controller/userController');
const userRouter = express.Router();

// User Login (public)
userRouter.post("/login", userController.loginUser);

// Create User (protected - requires permission check in frontend)
userRouter.post("/create", userController.createUser);

// Get User Details
userRouter.post("/detail", userController.getUserDetail);

// Get Users Created by a User
userRouter.post("/my-users", userController.getUsersByCreator);

// Get All Users (boss only)
userRouter.post("/all", userController.getAllUsers);

// Update User
userRouter.post("/update", userController.updateUser);

// Delete/Deactivate User
userRouter.post("/delete", userController.deleteUser);

module.exports = userRouter;
