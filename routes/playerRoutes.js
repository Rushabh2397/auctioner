const express = require('express');
const playerController = require('../controller/playerController');
const playerRouter = express.Router();

// Register New Player
playerRouter.post("/register", playerController.registerPlayer);

// Get All Player Details
playerRouter.post("/all", playerController.allPlayerDetails);

// Get Individual Player Detail
playerRouter.post("/detail", playerController.getPlayerDetail);

// Update Individual Player Details
playerRouter.post("/update", playerController.updatePlayer);

// Delete Player
playerRouter.post("/delete", playerController.deletePlayer);

// Get All Player Categories
playerRouter.post("/categories", playerController.getPlayerCategories);

// Bulk Create Players
playerRouter.post("/bulk-create", playerController.bulkCreatePlayers);

module.exports = playerRouter;
