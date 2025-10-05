const { Schema, model } = require('mongoose')

const tournamentHostSchema = new Schema({
    name: { type: String, require: true },
    logo: { type: String },
}, { collection: "tournamentHost", timestamps: true });


module.exports = model(tournamentHostSchema.options.collection, tournamentHostSchema);