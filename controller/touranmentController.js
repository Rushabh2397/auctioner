const tournament = require("../models/tournament")

module.exports = {
    addTournamnet: async (req, res) => {
        try {
            const newTouranment = new tournament(req.body);
            const savedTournamnet = await newTouranment.save()
            return res.status(201).json({
                messsge: "Tournamnet  addded successfully",
                data: savedTournamnet
            });
        } catch (error) {
            console.log("Error while creating tournamnet", error);
            return res.status(400).json({
                message: (error && error.message) || 'Oops! Failed to create tournament.'
            })
        }
    },

    getAllTournaments: async (req, res) => {
        try {
            const tournaments = await tournament.find({}).sort({ createdAt: -1 });
            return res.status(200).json({
                message: "Tournaments fetched successfully",
                data: tournaments
            });
        } catch (error) {
            console.log("Error while fetching tournaments", error);
            return res.status(500).json({
                message: (error && error.message) || 'Oops! Failed to fetch tournaments.'
            })
        }
    }
}