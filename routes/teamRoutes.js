const express = require('express');
const teamController = require('../controller/teamController');
const teamRouter = express.Router();

// Register New Team
teamRouter.post("/register", teamController.addTeam);

// Get All Team Details
teamRouter.post("/all", teamController.getTournamentTeamsReport);

// Get Individual Team Detail
teamRouter.post("/detail", teamController.getTeamReport);

// Update Individual Team
teamRouter.post("/update", teamController.updateTeam);

// Get All Team Names
teamRouter.post("/names", teamController.getTeamNames);

// Get All Team Names and Budget
teamRouter.post("/names-budget", teamController.getTeamNamesAndBudget);

module.exports = teamRouter;