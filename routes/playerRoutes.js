const express = require('express');
const playerController = require('../controller/playerController');
const { authMiddleware } = require('../utils/authMiddleware');
const playerRouter = express.Router();

// Register New Player - Protected
playerRouter.post("/register", authMiddleware, playerController.registerPlayer);

// Get All Player Details - Public (for viewing)
playerRouter.post("/all", playerController.allPlayerDetails);

// Get Individual Player Detail - Public (for viewing)
playerRouter.post("/detail", playerController.getPlayerDetail);

// Update Individual Player Details - Protected
playerRouter.post("/update", authMiddleware, playerController.updatePlayer);

// Delete Player - Protected
playerRouter.post("/delete", authMiddleware, playerController.deletePlayer);

// Get All Player Categories - Public (for viewing)
playerRouter.post("/categories", playerController.getPlayerCategories);

// Bulk Create Players - Protected
playerRouter.post("/bulk-create", authMiddleware, playerController.bulkCreatePlayers);

module.exports = playerRouter;
