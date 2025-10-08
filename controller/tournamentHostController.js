const TournamentHost = require("../models/tournamentHost");
const tournamentService = require("../services/tournamentHostService");
const { sendSuccess, sendError } = require("../utils");

const addTournamentHost = async (req, res) => {
    try {
        const tournamentHost = await tournamentService.addTournamentHost(req.body)
        return sendSuccess(res, 201, "Tournamnet Host added Successfully!", tournamentHost);
    } catch (error) {
        return sendError(res, 400, "Failed to add Touranment Host", error);
    }
}

const getTouranmentHostByName = async (req, res) => {
    try {
        const tournamentHost = await tournamentService.getTouranmentHostByName(req.query.name);
        return sendSuccess(res, 200, "Tournament Host Details.", tournamentHost);
    } catch (error) {
        if (error.code == "NOT_FOUND") {
            return sendError(res, 404, "Tournament Host with name " + req.body.name + " not found");
        }
        return sendError(res, 400, "Failed to get Touranment Host", error);
    }
}

module.exports = {
    addTournamentHost,
    getTouranmentHostByName
}