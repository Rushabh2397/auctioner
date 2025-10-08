const express = require('express')
const { validateAdduserSchema } = require('../validations/userValidation')
const { addUser, login } = require('../controller/userController')
const userRouter = express.Router()

userRouter.post("/", validateAdduserSchema, addUser)
userRouter.post("/login", login)







module.exports = userRouter