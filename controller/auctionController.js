const { Schema, default: mongoose } = require("mongoose");
const tournament = require("../models/tournament");

module.exports = {
    playerCategories : async (req, res) => {
        try {
            const { touranmentId } = req.body;

            if (!touranmentId) {
                return res.status(400).json({ message: "touranmentId is required" });
            }

            const tournamnetData = await tournament.findById(touranmentId);

            if (!tournamnetData) {
                return res.status(404).json({ message: "Tournament not found" });
            }

            return res.status(200).json({
                message: "Player categories fetched successfully",
                data: tournamnetData.playerCategories || []
            });
        } catch (error) {
            console.log("Error while fetching player categories", error);
            return res.status(500).json({
                message: (error && error.message) || 'Oops! Failed to fetch player categories.'
            });
        }
    }
};