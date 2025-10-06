const { Schema, default: mongoose } = require("mongoose");
const players = require("../models/players");
const { updateMany } = require("../models/tournamentHost");

module.exports = {
    playerReport: async (req, res) => {
        try {
            const tournamentId = req.body.touranmentId;

            if (!tournamentId) {
                return res.status(400).json({ message: "tournamentId is required" });
            }

            const aggregationPipeline = [
                {
                    $match: {
                        touranmentId: new mongoose.Types.ObjectId(tournamentId) // keep typo consistent with your schema
                    }
                },
                {
                    $lookup: {
                        from: "team", // collection name for teams
                        localField: "teamId",
                        foreignField: "_id",
                        as: "teamDetails"
                    }
                },
                {
                    $unwind: {
                        path: "$teamDetails",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        name: 1,
                        age: 1,
                        photo: 1,
                        skills: 1,
                        mobile: 1,
                        email: 1,
                        address: 1,
                        sold: 1,
                        auctionStatus: 1,
                        basePrice: 1,
                        amtSold: 1,
                        iconPlayer: 1,
                        teamName: "$teamDetails.name"
                    }
                }
            ];

            const playersReport = await players.aggregate(aggregationPipeline);

            return res.status(200).json({
                message: "Player report fetched successfully",
                data: playersReport
            });
        } catch (error) {
            console.error("Error while fetching player report", error);
            return res.status(500).json({
                message: (error && error.message) || "Oops! Failed to fetch player report."
            });
        }
    },
    updatePlayer: async (req, res) => {
        try {
            console.log("Request body:", req.body); // Debugging line

            const { playerId, teamId, sold, auctionStatus, amtSold } = req.body;

            if (!playerId) {
                return res.status(400).json({ message: "playerId is required" });
            }

            const updateData = {};

            if (teamId) updateData.teamId = teamId;
            if (typeof sold !== 'undefined') updateData.sold = sold;
            if (typeof auctionStatus !== 'undefined') updateData.auctionStatus = auctionStatus;
            if (typeof amtSold !== 'undefined') updateData.amtSold = amtSold;

            const updatedPlayer = await players.findByIdAndUpdate(
                playerId,
                { $set: updateData },
                { new: true } // Return the updated document
            );

            if (!updatedPlayer) {
                return res.status(404).json({ message: "Player not found" });
            }

            return res.status(200).json({
                message: "Player updated successfully",
                data: updatedPlayer
            });
        } catch (error) {
            console.error("Error while updating player", error);
            return res.status(500).json({
                message: (error && error.message) || "Oops! Failed to update player."
            });
        }
    },
    nextAuctionPlayer: async (req, res) => {
        try {
            const { touranmentId, playerCategory } = req.body;

            if (!touranmentId) {
                return res.status(400).json({ message: "touranmentId is required" });
            }

            // TODO Randomise 
            // Find the next player who is not sold and auctionStatus is false
            const nextPlayer = await players.findOne({
                touranmentId: touranmentId,
                sold: false,
                auctionStatus: false, // TODO Fetch from FE
                playerCategory: playerCategory // Filter by playerCategory if provided
            }); // Sort by creation time to get the earliest added player

            if (!nextPlayer) {
                return res.status(404).json({ message: "No more players available for auction." });
            }
// TODO Check if this is needed
            // // Update the auctionStatus of the found player to true
            // nextPlayer.auctionStatus = true;
            // await nextPlayer.save();

            return res.status(200).json({
                message: "Next player for auction fetched successfully",
                data: nextPlayer
            });
        } catch (error) {
            console.error("Error while fetching next auction player", error);
            return res.status(500).json({
                message: (error && error.message) || "Oops! Failed to fetch next auction player."
            });
        }
    }
};