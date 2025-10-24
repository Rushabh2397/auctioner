const { Schema, default: mongoose } = require("mongoose");
const players = require("../models/players");
const { updateMany } = require("../models/tournamentHost");
const team = require("../models/team");

const registerPlayer = async (playerInput) => {
    const player = await players.findOne({ touranmentId: playerInput.touranmentId, email: playerInput.email })
    if (player) {
        const err = new Error("Player already registered!");
        throw err;
    }
    const newPlayer = new players(playerInput);
    const savedPlayer = newPlayer.save();
    return savedPlayer;
}

const allPlayerDetails = async (touranmentId) => {
    const playerDetails = await players.find({ touranmentId: touranmentId });
    return playerDetails;
}

const getPlayerDetail = async (playerId) => {
    const playerDetail = await players.findById(playerId);
    return playerDetail;
}

const updatePlayer = async (playerInput) => {
    const updatedPlayer = await players.findByIdAndUpdate(playerInput.playerId, playerInput, { new: true });
    return updatedPlayer;
}

const deletePlayer = async (playerId) => {
    const deletedPlayer = await players.findByIdAndDelete(playerId);
    return deletedPlayer;
}

const getPlayerCategories = async (touranmentId) => {
    const categories = await players.distinct("playerCategory", { touranmentId: touranmentId });
    return categories;
}

module.exports = {
    registerPlayer,
    allPlayerDetails,
    getPlayerDetail,
    updatePlayer,
    deletePlayer,
    getPlayerCategories
}