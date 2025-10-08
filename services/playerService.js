const { playerReport } = require("../controller/playerController");
const Player = require("../models/players")

const getPlayerReport = async (touranmentId) => {
    if (!tournamentId) {
        const err = new Error("TournamentId is required");
        throw err
    }
    const aggregationPipeline = [
        {
            $match: {
                touranmentId: new mongoose.Types.ObjectId(tournamentId) // keep typo consistent with your schema
            }
        },
        {
            $lookup: {
                from: "team",
                localField: "teamId",
                foreignField: "_id",
                as: "teamDetails"
            }
        },
        {
            $unwind: {
                path: "$teamDetails",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                name: 1,
                age: 1,
                photo: 1,
                skills: 1,
                mobile: 1,
                email: 1,
                address: 1,
                sold: 1,
                auctionStatus: 1,
                basePrice: 1,
                amtSold: 1,
                iconPlayer: 1,
                teamName: "$teamDetails.name"
            }
        }
    ];

    const playerReport = await Player.aggregate(aggregationPipeline);
    return playerReport;
}

const updatePlayerDetails = async (playerUpdatedInput) => {

}

module.exports = {
    playerReport
}