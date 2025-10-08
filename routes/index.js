// const express = require('express')
// const tournamentHostController = require('../controller/tournamentHostController');
// const userController = require('../controller/userController');
// const touranmentController = require('../controller/touranmentController');
// const teamController = require('../controller/teamController');
// const playerController = require('../controller/playerController');
// const auctionController = require('../controller/auctionController');
// const router = express.Router()

const teamRouter = require("./teamRoutes");
const tournamentHostRouter = require("./touranmentHostRoutes");
const tournamentRouter = require("./tournamentRoutes");
const userRouter = require("./userRoutes");


// // tournamentHost apis

// router.post("/touranmentHost", tournamentHostController.addTournamentHost);

// // users route

// router.post("/user", userController.adduser)
// router.post("/user/login", userController.login)


// // touranment route

// router.post("/tournament", touranmentController.addTournamnet)


// // team route

// router.post("/team", teamController.addTeam)
// router.post("/team/report", teamController.teamReport)
// router.post("/team/individual_report", teamController.individualTeamReport)

// // player route

// router.post("/player/player_report", playerController.playerReport)
// router.post("/player/updatePlayer", playerController.updatePlayer)
// router.post("/player/nextAuctionPlayer", playerController.nextAuctionPlayer)

// // auction route

// router.post("/auction/playerCategories", auctionController.playerCategories)

// module.exports = router;

module.exports = {
    userRouter,
    tournamentRouter,
    tournamentHostRouter,
    teamRouter
}