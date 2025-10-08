const express = require("express");
const db = require("../db/index.js")
const app = express();
const config = require("../config/index.js")
const cors = require("cors")
const { userRouter, tournamentHostRouter, tournamentRouter, teamRouter } = require("../routes")


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use("/user", userRouter);
app.use("/tournamentHost", tournamentHostRouter);
app.use("/tournament", tournamentRouter)
app.use("/team", teamRouter)





app.listen(config.port, () => {
    console.log("Server listening on port 3000");
})