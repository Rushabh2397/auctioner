const express = require('express')
const { addTeam, getTournamentTeamsReport, getTeamReport } = require('../controller/teamController')
const teamRouter = express.Router()


teamRouter.post("/", addTeam)
teamRouter.post("/report", getTournamentTeamsReport)
teamRouter.post("/individual_report", getTeamReport)







module.exports = teamRouter