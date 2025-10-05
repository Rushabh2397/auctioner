const express = require('express')
const tournamentHostController = require('../controller/tournamentHostController');
const userController = require('../controller/userController');
const touranmentController = require('../controller/touranmentController');
const teamController = require('../controller/teamController');
const router = express.Router()


// tournamentHost apis

router.post("/touranmentHost", tournamentHostController.addTournamentHost);

// users route

router.post("/user", userController.adduser)
router.post("/user/login", userController.login)


// touranment route

router.post("/tournament", touranmentController.addTournamnet)


// team route

router.post("/team", teamController.addTeam)
router.post("/team/report", teamController.teamReport)
router.post("/team/individual_report", teamController.individualTeamReport)


module.exports = router;