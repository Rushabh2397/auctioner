const { Schema, default: mongoose } = require("mongoose");
const players = require("../models/players");
const team = require("../models/team");
const tournament = require("../models/tournament");

module.exports = {
    addTeam: async (req, res) => {
        try {
            const newTeam = new team(req.body);
            const savedTeam = newTeam.save();
            return res.status(201).json({
                message: "Team added successfully",
                data: savedTeam
            })
        } catch (error) {
            console.log("Error while creating team", error);
            return res.status(400).json({
                message: (error && error.message) || 'Oops! Failed to add team.'
            })
        }
    },
    teamReport: async (req, res) => {
        // tournamnetId 

        try {
            const aggegrationPipeline = [
                {
                    '$match': {
                        '_id': new mongoose.Types.ObjectId(req.body.touranmentId)
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
                                    'name': '$$t.name',
                                    'logo': '$$t.logo',
                                    'owner': '$$t.owner',
                                    'players': '$$t.players',
                                    'totalSpent': '$$t.totalSpent',
                                    'remainingBudget': {
                                        '$subtract': [
                                            '$totalBudget', '$$t.totalSpent'
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }, {
                    '$project': {
                        'name': 1,
                        'totalBudget': 1,
                        'teams': 1
                    }
                }
            ]
            const result = await tournament.aggregate(aggegrationPipeline);
            return res.status(200).json({ message: "Teams report", data: result })
        } catch (error) {
            return res.status(400).json({
                message: (error && error.message) || 'Oops! Failed to generate team report.'
            })
        }



    },
    individualTeamReport: async (req, res) => {
        try {
            const aggregationPipeline = [
                {
                    '$match': {
                        '_id': new mongoose.Types.ObjectId(req.body.teamId)
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

            const result = await team.aggregate(aggregationPipeline);
            res.status(200).json({
                message: "Individual team Report",
                data: result
            });

        } catch (error) {
            console.error('Aggregation error:', error);
            res.status(400).json({ error: 'Server error while generating team report' });
        }
    }
}