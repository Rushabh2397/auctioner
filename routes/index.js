const express = require('express');
const router = express.Router();

// Import all route modules
const tournamentHostRouter = require('./tournamentHostRoutes');
const userRouter = require('./userRoutes');
const tournamentRouter = require('./tournamentRoutes');
const teamRouter = require('./teamRoutes');
const playerRouter = require('./playerRoutes');
const auctionRouter = require('./auctionRoutes');

// Mount routes with their base paths
router.use("/touranmentHost", tournamentHostRouter);
router.use("/user", userRouter);
router.use("/tournament", tournamentRouter);
router.use("/team", teamRouter);
router.use("/player", playerRouter);
router.use("/auction", auctionRouter);

module.exports = router;