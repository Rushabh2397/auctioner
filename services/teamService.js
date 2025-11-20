const Team = require("../models/team");
const Tournament = require("../models/tournament")
const { Schema, default: mongoose } = require("mongoose");

const addTeam = async (teamInput) => {
    const team = await Team.findOne({ touranmentId: teamInput.touranmentId, name: teamInput.name })
    if (team) {
        const err = new Error("Team already exists!");
        throw err;
    }
    const newTeam = new Team(teamInput);
    const savedTeam = newTeam.save();
    return savedTeam;
}

const getTournamentTeamsReport = async (touranmentId) => {
    const aggegrationPipeline = [
        {
            '$match': {
                '_id': new mongoose.Types.ObjectId(touranmentId)
            }
        }, {
            '$lookup': {
                'from': 'team',
                'localField': '_id',
                'foreignField': 'touranmentId',
                'as': 'teams',
                'pipeline': [
                    {
                        '$lookup': {
                            'from': 'player',
                            'localField': '_id',
                            'foreignField': 'teamId',
                            'as': 'players'
                        }
                    }, {
                        '$addFields': {
                            'totalSpent': {
                                '$sum': {
                                    '$map': {
                                        'input': '$players',
                                        'as': 'p',
                                        'in': {
                                            '$cond': [
                                                {
                                                    '$ifNull': [
                                                        '$$p.amtSold', false
                                                    ]
                                                }, '$$p.amtSold', 0
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }, {
                        '$addFields': {
                            'remainingBudget': {
                                '$subtract': [
                                    '$$ROOT.totalBudget', '$totalSpent'
                                ]
                            }
                        }
                    }
                ]
            }
        }, {
            '$addFields': {
                'teams': {
                    '$map': {
                        'input': '$teams',
                        'as': 't',
                        'in': {
                            '_id': '$$t._id', // Include teamId
                            'name': '$$t.name',
                            'logo': '$$t.logo',
                            'owner': '$$t.owner',
                            'players': '$$t.players',
                            'totalSpent': '$$t.totalSpent',
                            'remainingBudget': {
                                '$subtract': [
                                    '$totalBudget', '$$t.totalSpent'
                                ]
                            },
                            'maxPlayersPerTeam': '$maxPlayersPerTeam' // Include maxPlayersPerTeam
                        }
                    }
                }
            }
        }, {
            '$project': {
                'name': 1,
                'totalBudget': 1,
                'maxPlayersPerTeam': 1,
                'teams': 1
            }
        }
    ];
    const report = await Tournament.aggregate(aggegrationPipeline);
    
    // Add base prices to players from tournament categoryBasePrices
    if (report && report.length > 0 && report[0].teams) {
        const tournamentData = await Tournament.findById(touranmentId);
        
        report[0].teams = report[0].teams.map(team => {
            if (team.players && Array.isArray(team.players)) {
                team.players = team.players.map(player => {
                    if (tournamentData && tournamentData.categoryBasePrices && player.playerCategory) {
                        const basePrice = tournamentData.categoryBasePrices.get(player.playerCategory);
                        player.basePrice = basePrice || 0;
                    } else {
                        player.basePrice = 0;
                    }
                    return player;
                });
            }
            return team;
        });
    }
    
    return report;
}

const getTeamReport = async (teamId) => {
    const aggregationPipeline = [
        {
            '$match': {
                '_id': new mongoose.Types.ObjectId(teamId)
            }
        }, {
            '$lookup': {
                'from': 'player',
                'localField': '_id',
                'foreignField': 'teamId',
                'as': 'players'
            }
        }, {
            '$lookup': {
                'from': 'tournament',
                'localField': 'touranmentId',
                'foreignField': '_id',
                'as': 'tournament'
            }
        }, {
            '$unwind': {
                'path': '$tournament',
                'preserveNullAndEmptyArrays': true
            }
        }, {
            '$addFields': {
                'totalSpent': {
                    '$sum': {
                        '$map': {
                            'input': '$players',
                            'as': 'p',
                            'in': {
                                '$ifNull': [
                                    '$$p.amtSold', 0
                                ]
                            }
                        }
                    }
                },
                'remainingBudget': {
                    '$subtract': [
                        '$tournament.totalBudget', {
                            '$sum': {
                                '$map': {
                                    'input': '$players',
                                    'as': 'p',
                                    'in': {
                                        '$ifNull': [
                                            '$$p.amtSold', 0
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        }, {
            '$project': {
                '_id': 1,
                'name': 1,
                'logo': 1,
                'owner': 1,
                'totalSpent': 1,
                'remainingBudget': 1,
                'players': 1,
                'tournament._id': 1,
                'tournament.name': 1,
                'tournament.totalBudget': 1
            }
        }
    ]

    const teamReport = await Team.aggregate(aggregationPipeline);
    
    // Add base prices to players from tournament categoryBasePrices
    if (teamReport && teamReport.length > 0 && teamReport[0].players) {
        const tournamentId = teamReport[0].tournament?._id;
        if (tournamentId) {
            const tournamentData = await Tournament.findById(tournamentId);
            
            teamReport[0].players = teamReport[0].players.map(player => {
                if (tournamentData && tournamentData.categoryBasePrices && player.playerCategory) {
                    const basePrice = tournamentData.categoryBasePrices.get(player.playerCategory);
                    player.basePrice = basePrice || 0;
                } else {
                    player.basePrice = 0;
                }
                return player;
            });
        }
    }
    
    return teamReport;
}

const updateTeam = async (payload) => {
    const { teamId, name, logo, owner } = payload;

    if (!teamId) throw new Error("teamId is required");

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (logo !== undefined) updateData.logo = logo;
    if (owner) {
        updateData.owner = {};
        if (owner.name) updateData.owner.name = owner.name.trim();
        if (owner.email) updateData.owner.email = owner.email.trim().toLowerCase();
        if (owner.mobile) updateData.owner.mobile = owner.mobile;
    }

    const updatedTeam = await Team.findByIdAndUpdate(
        teamId,
        { $set: updateData },
        { new: true }
    );

    if (!updatedTeam) throw new Error("Team not found");
    return updatedTeam;
}

const getTeamNames = async (touranmentId) => {
    if (!touranmentId) throw new Error("touranmentId is required");

    const teams = await Team.find(
        { touranmentId: new mongoose.Types.ObjectId(touranmentId) },
        { _id: 1, name: 1 }
    ).sort({ name: 1 });

    return teams;
}

const getTeamNamesAndBudget = async (touranmentId) => {
    try {
        const teams = await tournament.findById(touranmentId).select('teams.name teams.totalBudget');
        return teams;
    } catch (error) {
        throw error;
    }
};

const bulkCreateTeams = async (teams, touranmentId) => {
    try {
        // Check for duplicates in the input data
        const teamNames = teams.map(t => t.name);
        const duplicateNames = teamNames.filter((name, index) => teamNames.indexOf(name) !== index);
        
        if (duplicateNames.length > 0) {
            const err = new Error(`Duplicate team names found in CSV: ${[...new Set(duplicateNames)].join(', ')}`);
            throw err;
        }
        
        // Check for existing teams in database
        const existingTeams = await Team.find({
            touranmentId: touranmentId,
            name: { $in: teamNames }
        });
        
        if (existingTeams.length > 0) {
            const existingNames = existingTeams.map(t => t.name).join(', ');
            const err = new Error(`Teams already exist: ${existingNames}`);
            throw err;
        }
        
        // Create team documents
        const createdTeams = await Team.insertMany(teams);
        
        // Get team IDs
        const teamIds = createdTeams.map(t => t._id);
        
        // Update tournament with team IDs
        await Tournament.findByIdAndUpdate(
            touranmentId,
            { $push: { teams: { $each: teamIds } } },
            { new: true }
        );
        
        return createdTeams;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    addTeam,
    getTournamentTeamsReport,
    getTeamReport,
    updateTeam,
    getTeamNames,
    getTeamNamesAndBudget,
    bulkCreateTeams
}



// module.exports = {
//     addTeam,
//     getTournamentTeamsReport,
//     getTeamReport,
//     updateTeam,
//     getTeamNames,
//     getTeamNamesAndBudget
// }