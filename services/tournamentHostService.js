const TournamentHost = require("../models/tournamentHost")

const addTournamentHost = async (touranmentHostInput) => {
    const { name, logo } = touranmentHostInput
    const touranmentHost = await TournamentHost.findOne({ name })
    if (!touranmentHost) {
        const err = new Error("Tournament Host already exists!");
        throw err;
    }

    const newTournamentHost = new TournamentHost({ name, logo })
    const savedTouranment = await newTournamentHost.save()
    return savedTouranment;
}

const getTouranmentHostByName = async (name) => {
    const touranmentHost = await TournamentHost.findOne({ name })
    if (!touranmentHost) {
        const err = new Error("Tournament Host not found");
        err.code = "NOT_FOUND"
        throw err;
    }
    return touranmentHost;
}

module.exports = {
    addTournamentHost,
    getTouranmentHostByName
}