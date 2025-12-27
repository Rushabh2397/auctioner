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
    // Get next serial number
    const maxSerialPlayer = await players.findOne({ touranmentId: playerInput.touranmentId })
        .sort({ auctionSerialNumber: -1 })
        .select('auctionSerialNumber');

    const nextSerial = (maxSerialPlayer?.auctionSerialNumber || 0) + 1;

    const newPlayer = new players({
        ...playerInput,
        auctionSerialNumber: nextSerial
    });
    const savedPlayer = newPlayer.save();
    return savedPlayer;
}

const allPlayerDetails = async (touranmentId) => {
    const playerDetails = await players.find({ touranmentId: touranmentId });
    
    // Fetch tournament to get base prices for each category
    const Tournament = require('../models/tournament');
    const tournamentData = await Tournament.findById(touranmentId);
    
    // Add base price to each player based on their category
    const playersWithBasePrices = playerDetails.map(player => {
        const playerObj = player.toObject();
        if (tournamentData && tournamentData.categoryBasePrices && playerObj.playerCategory) {
            const basePrice = tournamentData.categoryBasePrices.get(playerObj.playerCategory);
            playerObj.basePrice = basePrice || 0;
        } else {
            playerObj.basePrice = 0;
        }
        return playerObj;
    });
    
    return playersWithBasePrices;
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

            // Get tournament name
            const Tournament = require('../models/tournament');
            const tournament = await Tournament.findById(updatedPlayer.touranmentId);
            const tournamentName = tournament?.name || 'Tournament';

            await whatsappService.sendPlayerSoldNotification({
                name: updatedPlayer.name,
                mobile: updatedPlayer.mobile,
                teamName: teamName,
                amtSold: updatedPlayer.amtSold || playerInput.amtSold,
                tournamentName: tournamentName,
                tournamentId: tournament._id
            });
            
            // Also send team purchase summary to team owner
            if (playerInput.teamId) {
                await whatsappService.sendTeamPurchaseSummary({
                    teamId: playerInput.teamId,
                    playerName: updatedPlayer.name,
                    amountPaid: updatedPlayer.amtSold || playerInput.amtSold,
                    tournamentId: updatedPlayer.touranmentId
                });
            }
        } catch (whatsappError) {
            // Log error but don't fail the update
            console.error('WhatsApp notification failed:', whatsappError.message);
        }
    }

    // Check if player went unsold (auctionStatus changed to true but sold is false)
    const wentUnsold = !existingPlayer.auctionStatus && 
                       (playerInput.auctionStatus === true || playerInput.auctionStatus === 1) &&
                       !updatedPlayer.sold;
    
    // If player went unsold, send WhatsApp notification
    if (wentUnsold && updatedPlayer) {
        console.log('Preparing to send WhatsApp notification for unsold player.---------------');
        try {
            // Get tournament name
            const Tournament = require('../models/tournament');
            const tournament = await Tournament.findById(updatedPlayer.touranmentId);
            const tournamentName = tournament?.name || 'Tournament';

            await whatsappService.sendPlayerUnsoldNotification({
                name: updatedPlayer.name,
                mobile: updatedPlayer.mobile,
                tournamentName: tournamentName
            });
        } catch (whatsappError) {
            // Log error but don't fail the update
            console.error('WhatsApp unsold notification failed:', whatsappError.message);
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
    
    // Get starting serial number
    const maxSerialPlayer = await players.findOne({ touranmentId: touranmentId })
        .sort({ auctionSerialNumber: -1 })
        .select('auctionSerialNumber');
    
    let currentSerial = (maxSerialPlayer?.auctionSerialNumber || 0);

    const playersWithSerial = playersData.map(p => {
        currentSerial++;
        return {
            ...p,
            auctionSerialNumber: currentSerial
        };
    });
    
    const createdPlayers = await players.insertMany(playersWithSerial);
    return createdPlayers;
}

const resetUnsoldPlayers = async (touranmentId) => {
    // Find and update all unsold players (auctionStatus = true, sold = false)
    const result = await players.updateMany(
        { 
            touranmentId: touranmentId,
            auctionStatus: true,
            sold: false
        },
        { 
            $set: { auctionStatus: false }
        }
    );
    
    return {
        count: result.modifiedCount,
        message: `${result.modifiedCount} unsold player(s) reset successfully`
    };
}

/**
 * Delete all players for a tournament
 * @param {String} tournamentId - Tournament ID
 * @returns {Object} Deletion result with count
 */
const deleteAllPlayersByTournament = async (tournamentId) => {
    if (!tournamentId) {
        throw new Error("Tournament ID is required");
    }

    const result = await players.deleteMany({ 
        touranmentId: new mongoose.Types.ObjectId(tournamentId) 
    });

    return { 
        deletedCount: result.deletedCount,
        message: `Successfully deleted ${result.deletedCount} players`
    };
};

module.exports = {
    registerPlayer,
    allPlayerDetails,
    getPlayerDetail,
    updatePlayer,
    deletePlayer,
    getPlayerCategories,
    bulkCreatePlayers,
    resetUnsoldPlayers,
    deleteAllPlayersByTournament
}