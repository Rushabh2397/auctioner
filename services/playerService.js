const { Schema, default: mongoose } = require("mongoose");
const players = require("../models/players");
// const { updateMany } = require("../models/tournamentHost");
const team = require("../models/team");
const whatsappService = require("./whatsappService");

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
    // Get the player before update to check if it's being marked as sold
    const existingPlayer = await players.findById(playerInput.playerId);
    
    if (!existingPlayer) {
        throw new Error("Player not found");
    }

    // Update the player
    const updatedPlayer = await players.findByIdAndUpdate(
        playerInput.playerId, 
        playerInput, 
        { new: true }
    ).populate('teamId', 'name');

    console.log('Updated Player:', updatedPlayer);
    console.log('Existing Player:', existingPlayer);
    console.log('Player Input:', playerInput);
    // Check if player was just sold (wasn't sold before, but is sold now)
    const wasJustSold = !existingPlayer.sold && (playerInput.sold === true || playerInput.sold === 1);
    console.log('Was just sold:', wasJustSold);

    

    // If player was just sold, send WhatsApp notification
    if (wasJustSold && updatedPlayer) {
        console.log('Preparing to send WhatsApp notification for sold player.---------------');
        try {
            // Get team name
            const teamName = updatedPlayer.teamId?.name || 
                            (playerInput.teamId ? 
                             (await team.findById(playerInput.teamId))?.name : 
                             'Unknown Team');

            await whatsappService.sendPlayerSoldNotification({
                name: updatedPlayer.name,
                mobile: updatedPlayer.mobile,
                teamName: teamName,
                amtSold: updatedPlayer.amtSold || playerInput.amtSold
            });
        } catch (whatsappError) {
            // Log error but don't fail the update
            console.error('WhatsApp notification failed:', whatsappError.message);
        }
    }

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

const bulkCreatePlayers = async (playersData, touranmentId) => {
    // Check for duplicates in the input data
    const playerNames = playersData.map(p => p.name);
    const duplicateNames = playerNames.filter((name, index) => playerNames.indexOf(name) !== index);
    
    if (duplicateNames.length > 0) {
        const err = new Error(`Duplicate player names found in CSV: ${[...new Set(duplicateNames)].join(', ')}`);
        throw err;
    }
    
    // Check for existing players in database
    const existingPlayers = await players.find({
        touranmentId: touranmentId,
        name: { $in: playerNames }
    });
    
    if (existingPlayers.length > 0) {
        const existingNames = existingPlayers.map(p => p.name).join(', ');
        const err = new Error(`Players already exist: ${existingNames}`);
        throw err;
    }
    
    const createdPlayers = await players.insertMany(playersData);
    return createdPlayers;
}

module.exports = {
    registerPlayer,
    allPlayerDetails,
    getPlayerDetail,
    updatePlayer,
    deletePlayer,
    getPlayerCategories,
    bulkCreatePlayers
}