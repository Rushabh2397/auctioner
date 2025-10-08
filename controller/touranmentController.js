const tournamentService = require("../services/touranmentService");
const { sendSuccess, sendError } = require("../utils");

const addTournament = async (req, res) => {
    try {
        const tournament = await tournamentService.addTournamnet(req.body);
        return sendSuccess(res, 201, "Tournament created Successfully!", tournament)
    } catch (error) {
        return sendError(res, 400, "Failed to add Tournamnet!", error)
    }
}

module.exports = {
    addTournament
}