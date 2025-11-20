const axios = require('axios');
const config = require('../config');

/**
 * Send WhatsApp notification when a player is sold
 * @param {Object} playerData - Player information
 * @param {string} playerData.name - Player name
 * @param {string} playerData.mobile - Player mobile number
 * @param {string} playerData.teamName - Team name that bought the player
 * @param {number} playerData.amtSold - Amount for which player was sold
 * @param {string} playerData.tournamentName - Tournament name (optional, will be fetched if not provided)
 * @param {string} playerData.tournamentId - Tournament ID (required if tournamentName not provided)
 */
const sendPlayerSoldNotification = async (playerData) => {
    try {
        let { name, mobile, teamName, amtSold, tournamentName, tournamentId } = playerData;
        
        // Fetch tournament name dynamically if not provided
        if (!tournamentName && tournamentId) {
            const Tournament = require('../models/tournament');
            const tournament = await Tournament.findById(tournamentId);
            tournamentName = tournament?.name || 'Tournament';
        }

        if (!mobile) {
            throw new Error("Player mobile number is required");
        }

        // Format mobile number - ensure it starts with country code
        let formattedMobile = mobile.toString();
        if (!formattedMobile.startsWith('+')) {
            // Assuming Indian numbers, add +91
            formattedMobile = `+91${formattedMobile}`;
        }

        const url = 'https://graph.facebook.com/v22.0/815105745024217/messages';
        
        const payload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: formattedMobile,
            type: "template",
            template: {
                name: "auction_sold_message",
                language: {
                    code: "en"
                },
                components: [
                    {
                        type: "body",
                        parameters: [
                            {
                                type: "text",
                                text: name || "Player"
                            },
                            {
                                type: "text",
                                text: teamName || "Unknown Team"
                            },
                            {
                                type: "text",
                                text: amtSold ? `${amtSold}` : "N/A"
                            },
                            {
                                type: "text",
                                text: tournamentName || "Tournament"
                            }
                        ]
                    }
                ]
            }
        };

        const headers = {
            'Authorization': `Bearer ${config.metaApiKey}`,
            'Content-Type': 'application/json'
        };

        const response = await axios.post(url, payload, { headers });
        
        console.log('WhatsApp notification sent successfully:', response.data);
        return response.data;

    } catch (error) {
        console.error('Error sending WhatsApp notification:', error.response?.data || error.message);
        // Don't throw error - we don't want to fail the player update if WhatsApp fails
        return null;
    }
};

module.exports = {
    sendPlayerSoldNotification
};
