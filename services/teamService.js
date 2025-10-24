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
    if (!touranmentId) throw new Error("touranmentId is required");

    const aggregationPipeline = [
        {
            '$match': {
                'touranmentId': new mongoose.Types.ObjectId(touranmentId)
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
                                '$ifNull': ['$$p.amtSold', 0]
                            }
                        }
                    }
                },
                'remainingBudget': {
                    '$subtract': [
                        '$tournament.totalBudget',
                        {
                            '$sum': {
                                '$map': {
                                    'input': '$players',
                                    'as': 'p',
                                    'in': {
                                        '$ifNull': ['$$p.amtSold', 0]
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
                'totalSpent': 1,
                'remainingBudget': 1,
                'totalBudget': '$tournament.totalBudget'
            }
        }, {
            '$sort': { 'name': 1 }
        }
    ];

    const teams = await Team.aggregate(aggregationPipeline);
    return teams;
}



module.exports = {
    addTeam,
    getTournamentTeamsReport,
    getTeamReport,
    updateTeam,
    getTeamNames,
    getTeamNamesAndBudget
}