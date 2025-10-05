require('dotenv').config();

module.exports = {
    port: process.env.PORT,
    mongoDBUri: process.env.MONGO_DB_URI
}