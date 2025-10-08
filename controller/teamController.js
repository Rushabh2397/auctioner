const teamService = require("../services/teamService");
const { sendSuccess, sendError } = require("../utils");



const addTeam = async (req, res) => {
    try {
        const team = await teamService.addTeam(req.body);
        return sendSuccess(res, 201, "Team added successfully!", team)
    } catch (error) {
        return sendError(res, 400, "Failed to add team!", error)
    }
}

const getTournamentTeamsReport = async (req, res) => {
    try {
        const report = await teamService.getTournamentTeamsReport(req.body.touranmentId)
        return sendSuccess(res, 200, "Tournament Teams report", report)
    } catch (error) {
        return sendError(res, 400, "Failed to get tournamnet teams report!", error)
    }
}

const getTeamReport = async (req, res) => {
    try {
        const report = await teamService.getTeamReport(req.body.teamId)
        return sendSuccess(res, 200, "Team report", report)
    } catch (error) {
        return sendError(res, 400, "Failed to get  team report!", error)
    }
}

module.exports = {
    addTeam,
    getTournamentTeamsReport,
    getTeamReport
}