const { Schema, model } = require('mongoose')


const tournamentSchema = new Schema({
    name: { type: String, require: true },
    tournamentHostId: { type: Schema.Types.ObjectId },
    noOfTeams: { type: Number },
    maxPlayersPerTeam: { type: Number },
    minPlayersPerTeam: { type: Number },
    totalBudget: { type: Number }
}, { collection: "tournament", timestamps: true });

module.exports = model(tournamentSchema.options.collation, tournamentSchema);