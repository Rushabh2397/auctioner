const Tournament = require("../models/tournament")

const addTournamnet = async (tournamentInput) => {
    const newTouranment = new Tournament(tournamentInput);
    const savedTournamnet = await newTouranment.save()
    return savedTournamnet;
}

module.exports = {
    addTournamnet
}