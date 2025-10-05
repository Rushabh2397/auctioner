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
    }
}