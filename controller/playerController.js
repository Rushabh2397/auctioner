const { Schema, default: mongoose } = require("mongoose");
const players = require("../models/players");
const { updateMany } = require("../models/tournamentHost");
const team = require("../models/team");

module.exports = {
  playerReport: async (req, res) => {
    try {
      const tournamentId = req.body.touranmentId;

      if (!tournamentId) {
        return res.status(400).json({ message: "tournamentId is required" });
      }

      const aggregationPipeline = [
        {
          $match: {
            touranmentId: new mongoose.Types.ObjectId(tournamentId), // keep typo consistent with your schema
          },
        },
        {
          $lookup: {
            from: "team", // collection name for teams
            localField: "teamId",
            foreignField: "_id",
            as: "teamDetails",
          },
        },
        {
          $unwind: {
            path: "$teamDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            name: 1,
            age: 1,
            photo: 1,
            skills: 1,
            mobile: 1,
            email: 1,
            address: 1,
            sold: 1,
            auctionStatus: 1,
            basePrice: 1,
            amtSold: 1,
            iconPlayer: 1,
            teamName: "$teamDetails.name",
            playerCategory: 1,
            touranmentId: 1
          },
        },
      ];

      const playersReport = await players.aggregate(aggregationPipeline);

      // Randomize order of player report before returning
      const shuffledPlayers = playersReport.sort(() => Math.random() - 0.5);

      return res.status(200).json({
        message: "Player report fetched successfully",
        data: shuffledPlayers,
      });
    } catch (error) {
      console.error("Error while fetching player report", error);
      return res.status(500).json({
        message:
          (error && error.message) || "Oops! Failed to fetch player report.",
      });
    }
  },
  updatePlayer: async (req, res) => {
    try {
      console.log("Request body:", req.body); // Debugging line

      const { 
        playerId, 
        name,
        age,
        gender,
        mobile,
        email,
        address,
        skills,
        playerCategory,
        basePrice,
        photo,
        teamId, 
        sold, 
        auctionStatus, 
        amtSold,
        iconPlayer
      } = req.body;

      if (!playerId) {
        return res.status(400).json({ message: "playerId is required" });
      }

      const updateData = {};

      // Update basic player information
      if (name) updateData.name = name.trim();
      if (age !== undefined) updateData.age = parseInt(age);
      if (gender) updateData.gender = gender;
      if (mobile !== undefined) updateData.mobile = parseInt(mobile);
      if (email) updateData.email = email.trim().toLowerCase();
      if (address !== undefined) updateData.address = address;
      if (skills) updateData.skills = skills;
      if (playerCategory) updateData.playerCategory = playerCategory;
      if (basePrice !== undefined) updateData.basePrice = parseInt(basePrice);
      if (photo !== undefined) updateData.photo = photo;

      // Update auction-related fields
      if (teamId) updateData.teamId = teamId;
      if (typeof sold !== "undefined") updateData.sold = sold;
      if (typeof auctionStatus !== "undefined")
        updateData.auctionStatus = auctionStatus;
      if (typeof amtSold !== "undefined") updateData.amtSold = amtSold;
      if (typeof iconPlayer !== "undefined") updateData.iconPlayer = iconPlayer;

      const updatedPlayer = await players.findByIdAndUpdate(
        playerId,
        { $set: updateData },
        { new: true } // Return the updated document
      );

      if (!updatedPlayer) {
        return res.status(404).json({ message: "Player not found" });
      }

      return res.status(200).json({
        message: "Player updated successfully",
        data: updatedPlayer,
      });
    } catch (error) {
      console.error("Error while updating player", error);
      return res.status(500).json({
        message: (error && error.message) || "Oops! Failed to update player.",
      });
    }
  },
  nextAuctionPlayer: async (req, res) => {
    try {
      const { touranmentId, playerCategory } = req.body;

      if (!touranmentId) {
        return res.status(400).json({ message: "touranmentId is required" });
      }

      // Randomize selection: use aggregation with $match + $sample
      let match = {
        touranmentId: new mongoose.Types.ObjectId(touranmentId),
        sold: false,
        auctionStatus: false,
      };
      if (playerCategory) match.playerCategory = playerCategory;

      if (playerCategory === "Regular") {
        match = {
          $or: [
            {
              touranmentId: new mongoose.Types.ObjectId(touranmentId),
              sold: false,
              auctionStatus: false,
                playerCategory: "Regular",
            },
            {
              touranmentId: new mongoose.Types.ObjectId(touranmentId),
              sold: false,
              auctionStatus: true,
              playerCategory: "Icon",
            },
          ],
        };
      }

      const pipeline = [{ $match: match }, { $sample: { size: 1 } }];

      const result = await players.aggregate(pipeline);
      const nextPlayer =
        Array.isArray(result) && result.length > 0 ? result[0] : null;

      if (!nextPlayer) {
        return res
          .status(404)
          .json({ message: "No more players available for auction." });
      }

      // TODO Check if this is needed
      // // Update the auctionStatus of the found player to true
      // nextPlayer.auctionStatus = true;
      // await nextPlayer.save();

      return res.status(200).json({
        message: "Next player for auction fetched successfully",
        data: nextPlayer,
      });
    } catch (error) {
      console.error("Error while fetching next auction player", error);
      return res.status(500).json({
        message:
          (error && error.message) ||
          "Oops! Failed to fetch next auction player.",
      });
    }
  },

  registerPlayer: async (req, res) => {
    try {
      const {
        name,
        age,
        gender,
        mobile,
        email,
        address,
        skills,
        playerCategory,
        basePrice,
        touranmentId,
        photo
      } = req.body;

      // Validation
      if (!name || !age || !gender || !mobile || !email || !skills || !playerCategory || !basePrice || !touranmentId) {
        return res.status(400).json({ 
          message: "Required fields: name, age, gender, mobile, email, skills, playerCategory, basePrice, touranmentId" 
        });
      }

      // Validate age
      if (age < 10 || age > 50) {
        return res.status(400).json({ message: "Age must be between 10 and 50" });
      }

      // Validate mobile number
      if (mobile.toString().length !== 10) {
        return res.status(400).json({ message: "Mobile number must be 10 digits" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }

      // Validate base price
      if (basePrice < 100) {
        return res.status(400).json({ message: "Base price must be at least 100 points" });
      }

      // Check if player with same email or mobile already exists in this tournament
      const existingPlayer = await players.findOne({
        touranmentId: new mongoose.Types.ObjectId(touranmentId),
        $or: [
          { email: email },
          { mobile: mobile }
        ]
      });

      if (existingPlayer) {
        return res.status(400).json({ 
          message: "A player with this email or mobile number is already registered for this tournament" 
        });
      }

      // Create new player
      const newPlayer = new players({
        name: name.trim(),
        age: parseInt(age),
        gender,
        mobile: parseInt(mobile),
        email: email.trim().toLowerCase(),
        address: address || "",
        skills,
        playerCategory,
        basePrice: parseInt(basePrice),
        touranmentId: new mongoose.Types.ObjectId(touranmentId),
        photo: photo || "",
        sold: false,
        auctionStatus: false,
        teamId: null,
        amtSold: null
      });

      const savedPlayer = await newPlayer.save();

      return res.status(201).json({
        message: "Player registered successfully",
        data: {
          _id: savedPlayer._id,
          name: savedPlayer.name,
          age: savedPlayer.age,
          gender: savedPlayer.gender,
          mobile: savedPlayer.mobile,
          email: savedPlayer.email,
          playerCategory: savedPlayer.playerCategory,
          basePrice: savedPlayer.basePrice,
          skills: savedPlayer.skills
        }
      });

    } catch (error) {
      console.error("Error during player registration:", error);
      return res.status(500).json({
        message: (error && error.message) || "Failed to register player. Please try again.",
      });
    }
  },

  deletePlayer: async (req, res) => {
    try {
      const { playerId } = req.body;

      if (!playerId) {
        return res.status(400).json({ message: "playerId is required" });
      }

      const deletedPlayer = await players.findByIdAndDelete(playerId);

      if (!deletedPlayer) {
        return res.status(404).json({ message: "Player not found" });
      }

      return res.status(200).json({
        message: "Player deleted successfully",
        data: deletedPlayer,
      });
    } catch (error) {
      console.error("Error while deleting player", error);
      return res.status(500).json({
        message: (error && error.message) || "Oops! Failed to delete player.",
      });
    }
  },
};
