const whatsappService = require("../services/whatsappService");
const { sendSuccess, sendError } = require("../utils");

/**
 * Send WhatsApp notification when player is sold
 * Expects: { name, mobile, teamName, amtSold }
 */
const notifyPlayerSold = async (req, res) => {
    try {
        const { name, mobile, teamName, amtSold } = req.body;
        
        if (!name || !mobile || !teamName) {
            return sendError(res, 400, "Missing required fields: name, mobile, teamName");
        }

        const result = await whatsappService.sendPlayerSoldNotification({
            name,
            mobile,
            teamName,
            amtSold
        });

        if (result) {
            return sendSuccess(res, 200, "WhatsApp notification sent successfully", result);
        } else {
            return sendError(res, 500, "Failed to send WhatsApp notification");
        }
    } catch (error) {
        return sendError(res, 500, "Failed to send WhatsApp notification", error);
    }
};

/**
 * Test WhatsApp connection
 * Expects: { mobile }
 */
const testWhatsApp = async (req, res) => {
    try {
        const { mobile } = req.body;
        
        if (!mobile) {
            return sendError(res, 400, "Mobile number is required");
        }

        const result = await whatsappService.sendPlayerSoldNotification({
            name: "Test Player",
            mobile: mobile,
            teamName: "Test Team",
            amtSold: 10000
        });

        if (result) {
            return sendSuccess(res, 200, "Test WhatsApp message sent successfully", result);
        } else {
            return sendError(res, 500, "Failed to send test message");
        }
    } catch (error) {
        return sendError(res, 500, "Failed to send test message", error);
    }
};

module.exports = {
    notifyPlayerSold,
    testWhatsApp
};
