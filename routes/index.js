const express = require('express')
const tournamentHostController = require('../controller/tournamentHostController');
const userController = require('../controller/userController');
const touranmentController = require('../controller/touranmentController');
const teamController = require('../controller/teamController');
const playerController = require('../controller/playerController');
const auctionController = require('../controller/auctionController');
const router = express.Router()


// tournamentHost apis

router.post("/api/touranmentHost", tournamentHostController.addTournamentHost);

// users route

router.post("/api/user", userController.adduser)
router.post("/api/user/login", userController.login)


// touranment route

router.post("/api/tournament", touranmentController.addTournamnet)


// team route

router.post("/api/team", teamController.addTeam)
router.post("/api/team/report", teamController.teamReport)
router.post("/api/team/individual_report", teamController.individualTeamReport)

// player route

router.post("/api/player/player_report", playerController.playerReport)
router.post("/api/player/updatePlayer", playerController.updatePlayer)
router.post("/api/player/nextAuctionPlayer", playerController.nextAuctionPlayer)

// auction route

router.post("/api/auction/playerCategories", auctionController.playerCategories)

module.exports = router;