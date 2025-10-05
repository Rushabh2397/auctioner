const { Schema, model } = require('mongoose')
const { decrypt, encrypt } = require('../utils/encryDecry')


const userSchema = new Schema({
    name: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    tournamnetHostId: { type: Schema.Types.ObjectId }
}, { collection: "user", timestamps: true })

userSchema.pre('save', function (next) {
    let user = this;
    user.password = encrypt(user.password);
    next()
})

module.exports = model(userSchema.options.collection, userSchema)