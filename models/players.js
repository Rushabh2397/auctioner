const { Schema, model } = require('mongoose')


const playerSchema = new Schema({
    name: { type: String },
    age: { type: Number },
    photo: { type: String },
    skills: [{ type: String }],
    mobile: { type: Number },
    email: { type: String },
    address: { type: String },
    touranmentId: { type: Schema.Types.ObjectId },
    teamId: { type: Schema.Types.ObjectId },
    sold: { type: Boolean },
    auctionStatus: { type: Boolean },
    basePrice: { type: Number },
    amtSold: { type: Number },
    iconPlayer: { type: Boolean }
}, { collection: "player", timestamps: true })

module.exports = model(playerSchema.options.collection, playerSchema);