const TournamentHost = require("../models/tournamentHost");

module.exports = {

    addTournamentHost: async (req, res) => {
        try {
            const newTournamentHost = new TournamentHost({
                name: req.body.name,
                logo: req.body.logo
            })
            const savedTouranment = await newTournamentHost.save()
            return res.status(201).json({
                messsge: "Tournamnet Host addded successfully",
                data: savedTouranment
            });
        } catch (error) {
            console.log("Error while creating new tournament host", error);
            return res.status(400).json({
                message: (error && error.message) || 'Oops! Failed to add touranment host.'
            })
        }
    }
}