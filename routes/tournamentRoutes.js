const express = require('express');
const touranmentController = require('../controller/touranmentController');
const tournamentRouter = express.Router();

// Register New Tournament
tournamentRouter.post("/register", touranmentController.addTournamnet);

// Get All Tournaments
tournamentRouter.get("/all", touranmentController.getAllTournaments);

// Get Individual Tournament Detail
// tournamentRouter.post("/detail", touranmentController.getTournamentDetail);

// Update Tournament
// tournamentRouter.post("/update", touranmentController.updateTournament);

module.exports = tournamentRouter;