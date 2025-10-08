const express = require('express')
const { addTournamentHost, getTouranmentHostByName } = require('../controller/tournamentHostController')
const { validateTournamentHostSchema } = require('../validations/tournamentHostValidation')
const tournamentHostRouter = express.Router()

tournamentHostRouter.post("/", validateTournamentHostSchema, addTournamentHost)
tournamentHostRouter.get("/", getTouranmentHostByName)







module.exports = tournamentHostRouter