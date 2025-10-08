const express = require('express')
const tournamentRouter = express.Router()
const { addTournament } = require("../controller/touranmentController")

tournamentRouter.post("/", addTournament)







module.exports = tournamentRouter