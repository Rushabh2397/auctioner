const express = require('express');
const whatsappController = require('../controller/whatsappController');
const whatsappRouter = express.Router();

// Send notification when player is sold
whatsappRouter.post("/notify-player-sold", whatsappController.notifyPlayerSold);

// Test WhatsApp connection
whatsappRouter.post("/test", whatsappController.testWhatsApp);

module.exports = whatsappRouter;
