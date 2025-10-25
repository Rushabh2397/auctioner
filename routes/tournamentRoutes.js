const express = require('express');
const touranmentController = require('../controller/touranmentController');
const tournamentRouter = express.Router();

// Register New Tournament
tournamentRouter.post("/register", touranmentController.addTournamnet);

// Get All Tournaments (filtered by role)
tournamentRouter.post("/all", touranmentController.getAllTournaments);

// Get Individual Tournament Detail
tournamentRouter.post("/detail", touranmentController.getTournamentDetail);

// Update Tournament
tournamentRouter.post("/update", touranmentController.updateTournament);

// Delete Tournament
tournamentRouter.post("/delete", touranmentController.deleteTournament);

// Get All Tournament Hosts (for boss and super_user)
tournamentRouter.get("/hosts", touranmentController.getAllTournamentHosts);

module.exports = tournamentRouter;