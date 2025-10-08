const express = require("express");
const db = require("../db/index.js")
const app = express();
const config = require("../config/index.js")
const cors = require("cors")
const router = require("../routes/index.js")

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use("/api", router)






app.listen(config.port, () => {
    console.log("Server listening on port 3000");
})