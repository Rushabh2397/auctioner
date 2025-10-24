const express = require('express');
const tournamentHostController = require('../controller/tournamentHostController');
const tournamentHostRouter = express.Router();

// Register Tournament Host
// tournamentHostRouter.post("/register", tournamentHostController.addTournamentHost);

// Login as a Host
// tournamentHostRouter.post("/login", tournamentHostController.login);

module.exports = tournamentHostRouter;
