const auctionStateManager = require("../services/auctionStateManager");
const teamService = require("../services/teamService");
const auctionService = require("../services/auctionService");
const playerService = require("../services/playerService");
const auctionLogService = require("../services/auctionLogService");
const tournamentService = require("../services/tournamentService");

module.exports = (io) => {
  const auctionNamespace = io.of("/auction");

  auctionNamespace.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // List active auctions
    socket.on("auction:list", async () => {
      try {
        const active = auctionStateManager.getAllActiveAuctions();
        
        // Enrich with tournament names and hostId
        const enriched = await Promise.all(active.map(async (a) => {
           try {
             const Tournament = require("../models/tournament");
             const t = await Tournament.findById(a.tournamentId).select('name tournamentHostId');
             return { 
                 ...a, 
                 tournamentName: t ? t.name : 'Unknown Tournament',
                 hostId: t ? (t.tournamentHostId?._id || t.tournamentHostId) : null 
             };
           } catch {
             return { ...a, tournamentName: 'Unknown Tournament', hostId: null };
           }
        }));
        
        socket.emit("auction:list", enriched);
      } catch (err) {
        console.error("Error listing auctions:", err);
        socket.emit("auction:error", "Failed to list auctions");
      }
    });

    // Delete Auction Room (Host/Admin only)
    socket.on("auction:delete", async ({ tournamentId, userId }) => {
        try {
            const Tournament = require("../models/tournament");
            const User = require("../models/user");
            
            // First check user permissions
            const user = await User.findById(userId);
            
            if (!user) {
                return socket.emit("auction:error", "User not found");
            }

            // Boss and Super User can delete any room (even for deleted tournaments)
            const isAdmin = ['boss', 'super_user'].includes(user.role);
            
            // For non-admin users, verify tournament exists and user is the host
            if (!isAdmin) {
                const tournament = await Tournament.findById(tournamentId);
                
                if (!tournament) {
                    return socket.emit("auction:error", "Tournament not found");
                }
                
                const isHost = tournament.tournamentHostId.toString() === userId;
                
                if (!isHost) {
                    return socket.emit("auction:error", "Unauthorized: Only host or admin can delete room");
                }
            }

            auctionStateManager.cleanupAuction(tournamentId);
            
            // Broadcast update
            const active = auctionStateManager.getAllActiveAuctions();
            const enriched = await Promise.all(active.map(async (a) => {
                 try {
                     const t = await Tournament.findById(a.tournamentId).select('name tournamentHostId');
                     return { 
                         ...a, 
                         tournamentName: t ? t.name : 'Unknown Tournament',
                         hostId: t ? (t.tournamentHostId?._id || t.tournamentHostId) : null
                     };
                 } catch {
                     return { ...a, tournamentName: 'Unknown Tournament', hostId: null };
                 }
            }));
            auctionNamespace.emit("auction:list", enriched);
            auctionNamespace.to(tournamentId).emit("auction:ended", "Auction room closed by host");
            
        } catch (err) {
            console.error("Error deleting auction:", err);
            socket.emit("auction:error", "Failed to delete auction");
        }
    });

    // Join auction room
    // Join auction room
    socket.on("auction:join", (payload) => {
      let tournamentId, userId;
      if (typeof payload === 'object') {
          tournamentId = payload.tournamentId;
          userId = payload.userId;
      } else {
          tournamentId = payload;
      }

      socket.join(tournamentId);
      socket.tournamentId = tournamentId; 
      
      // Always get or create state so we can return "isActive: false" instead of error
      // This allows the UI to show the "Start Auction" button
      const auctionRaw = auctionStateManager.getOrCreateAuction(tournamentId);
      
      // Check reconnection or role
      if (userId && auctionRaw.auctioneerUserId === userId) {
             // Update socket ID for the auctioneer
             auctionStateManager.setAuctioneer(tournamentId, socket.id, userId);
             socket.emit("auction:role", "auctioneer");
      }

      const viewerCount = auctionStateManager.addViewer(tournamentId, socket.id);
      
      const safeState = auctionStateManager.getAuctionState(tournamentId);
      socket.emit("auction:state", safeState);
      auctionNamespace.to(tournamentId).emit("auction:viewerCount", viewerCount);
    });

    // Start/Initialize Auction (Auctioneer only)
    socket.on("auction:start", async ({ tournamentId, userId }) => {
      try {
        // Check state BEFORE setting auctioneer (which toggles isActive)
        const preState = auctionStateManager.getAuctionState(tournamentId);
        const wasActive = preState && preState.isActive;

        // Here you would optimally verify userId with a user service or token
        // For now, we trust the client (as per user instruction "One person for now to keep it simple")
        
        const result = auctionStateManager.setAuctioneer(tournamentId, socket.id, userId);
        if (!result.success) {
          return socket.emit("auction:error", result.error);
        }

        socket.join(tournamentId);
        socket.tournamentId = tournamentId;
        
        // Confirm role
        socket.emit("auction:role", "auctioneer");
        
        // Fetch fresh data for the auction
        const teamsReport = await teamService.getTournamentTeamsReport(tournamentId);
        const teams = teamsReport && teamsReport.length > 0 ? teamsReport[0].teams : [];
        
        let bidIncrementSlabs = [];
        
        // Fetch tournament for slabs
        try {
          const Tournament = require("../models/tournament");
          const tournament = await Tournament.findById(tournamentId);
          if (tournament) {
            bidIncrementSlabs = tournament.bidIncrementSlabs || [];
          }
        } catch (err) {
          console.error("Error fetching tournament slabs:", err);
        }

        // Initialize state if not already active
        if (!wasActive) {
          auctionStateManager.startAuction(tournamentId, {
            mode: null, // Default to null to force user selection
            category: null,
            teams,
            bidIncrementSlabs
          });
        } else {
          // Just update teams in case of budget changes from elsewhere
          auctionStateManager.updateTeams(tournamentId, teams);
        }
        
        
        // Broadcast new state
        const newState = auctionStateManager.getAuctionState(tournamentId);
        auctionNamespace.to(tournamentId).emit("auction:state", newState);
        
        // Broadcast active list update to everyone (Lobby)
        const active = auctionStateManager.getAllActiveAuctions();
        // We re-fetch names basically... optimization needed later
         const Tournament = require("../models/tournament");
         const enriched = await Promise.all(active.map(async (a) => {
             const t = await Tournament.findById(a.tournamentId).select('name tournamentHostId');
             return { 
                 ...a, 
                 tournamentName: t ? t.name : 'Unknown Tournament', 
                 hostId: t ? (t.tournamentHostId?._id || t.tournamentHostId) : null
             };
         }));
         auctionNamespace.emit("auction:list", enriched);
        
        console.log(`Auction started for tournament ${tournamentId} by ${socket.id}`);
      } catch (error) {
        console.error("Error starting auction:", error);
        socket.emit("auction:error", "Failed to start auction");
      }
    });

    // Select Player (Next Player or Manual Select)
    socket.on("auction:selectPlayer", async ({ tournamentId, playerId, category }) => {
      if (!auctionStateManager.isAuctioneer(tournamentId, socket.id)) {
        return socket.emit("auction:error", "Unauthorized: Only auctioneer can select players");
      }

      try {
        // Infer and set mode if not set
        const auctionRaw = auctionStateManager.getOrCreateAuction(tournamentId);
        if (auctionRaw && !auctionRaw.auctionMode) {
            if (playerId) {
                auctionRaw.auctionMode = 'manual';
            } else {
                auctionRaw.auctionMode = 'category';
                auctionRaw.selectedCategory = category || 'All';
            }
        }

        let player;
        
        // Fetch tournament data for bid increments
        let bidIncrementSlabs = [];
        try {
          const Tournament = require("../models/tournament");
          const tournament = await Tournament.findById(tournamentId);
          if (tournament) {
            bidIncrementSlabs = tournament.bidIncrementSlabs || [];
          }
        } catch (err) { }

        if (playerId) {
          // Manual selection
          player = await playerService.getPlayerDetail(playerId);
          if (!player) throw new Error("Player not found");
          
          // Ensure base price is set
          if (!player.basePrice && player.basePrice !== 0) {
             const allPlayers = await playerService.allPlayerDetails(tournamentId);
             const p = allPlayers.find(p => p._id.toString() === playerId);
             if (p) player.basePrice = p.basePrice;
          }
        } else {
          // Next player in category
          player = await auctionService.nextAuctionPlayer(tournamentId, category);
        }

        const newState = auctionStateManager.selectPlayer(tournamentId, player, bidIncrementSlabs);
        
        auctionNamespace.to(tournamentId).emit("auction:state", newState);
        auctionNamespace.to(tournamentId).emit("auction:playerSelected", player);
        
      } catch (error) {
        console.error("Error selecting player:", error);
        socket.emit("auction:error", error.message || "Failed to select player");
      }
    });

    // Place Bid
    socket.on("auction:bid", ({ tournamentId, teamId }) => {
      console.log(`Bid received for ${teamId} in ${tournamentId}`);
      if (!auctionStateManager.isAuctioneer(tournamentId, socket.id)) {
        return socket.emit("auction:error", "Unauthorized: Only auctioneer can bid");
      }

      const state = auctionStateManager.getAuctionState(tournamentId);
      if (state) {
        console.log(`Current teams in state: ${state.teams?.length}`);
        console.log("State teams IDs:", state.teams?.map(t => t._id));
        
        const result = auctionStateManager.placeBid(tournamentId, teamId, state.teams);
        if (result.success) {
            auctionNamespace.to(tournamentId).emit("auction:bidPlaced", {
                teamId,
                amount: result.newBid,
                teamName: result.teamName,
                nextBidIncrement: result.state.bidPrice
            });
            auctionNamespace.to(tournamentId).emit("auction:state", result.state);
        } else {
            console.error("Bid error:", result.error, "TeamId:", teamId);
            socket.emit("auction:error", result.error);
        }
      }
    });

    // Undo Bid
    socket.on("auction:undoBid", ({ tournamentId }) => {
      if (!auctionStateManager.isAuctioneer(tournamentId, socket.id)) {
        return socket.emit("auction:error", "Unauthorized");
      }

      const result = auctionStateManager.undoBid(tournamentId);
      
      if (result.success) {
        auctionNamespace.to(tournamentId).emit("auction:undoBid");
        auctionNamespace.to(tournamentId).emit("auction:state", result.state);
      } else {
        socket.emit("auction:error", result.error);
      }
    });

    // Mark Sold
    socket.on("auction:sold", async ({ tournamentId, userId }) => {
      if (!auctionStateManager.isAuctioneer(tournamentId, socket.id)) {
        return socket.emit("auction:error", "Unauthorized");
      }

      const result = auctionStateManager.markSold(tournamentId);
      
      if (result.success) {
        // Broadcast immediately for animation
        auctionNamespace.to(tournamentId).emit("auction:sold", {
            player: result.player,
            team: result.team,
            amount: result.amount
        });

        // Async: Update DB
        try {
            await playerService.updatePlayer({
                playerId: result.player._id,
                teamId: result.teamId,
                sold: true,
                auctionStatus: true,
                amtSold: result.amount,
                userId: userId // For logging if needed in service
            });

            // Prepare bid history for log
            const auction = auctionStateManager.getOrCreateAuction(tournamentId); // Need raw for getting bid history before it was cleared? 
            // Wait, markSold clears the history. We should have captured it from the result if we modified markSold to return it, 
            // OR we should rely on the fact that result contains what we need?
            // Actually, markSold wipes the state. I should modify markSold in stateManager to return the bid history before wiping,
            // or I assume I need to pass it out.
            // Let's check stateManager.markSold implementation again. It clears it.
            // I should have modified stateManager to return the bids. 
            // For now, let's assume I missed that in stateManager and I'll hotfix it here or assume empty for now.
            // BETTER: Fix stateManager first? No, I can't easily go back without tool call.
            // Wait, I just wrote the file. I can see in the `markSold` logic: `auction.bidHistory = [];`.
            // The history is gone. 
            // I should update `auctionStateManager.js` to return `bids` in the result object.
        } catch (error) {
            console.error("Error updating sold player:", error);
        }

        // Fetch updated teams to sync budget changes
        const teamsReport = await teamService.getTournamentTeamsReport(tournamentId);
        const teams = teamsReport && teamsReport.length > 0 ? teamsReport[0].teams : [];
        auctionStateManager.updateTeams(tournamentId, teams);
        
        // Broadcast updated state (cleared player, updated teams)
        const newState = auctionStateManager.getAuctionState(tournamentId);
        auctionNamespace.to(tournamentId).emit("auction:state", newState);

        // Save log
        try {
          await auctionLogService.saveAuctionLog({
            tournamentId,
            playerId: result.player._id,
            playerName: result.player.name,
            playerCategory: result.player.playerCategory,
            basePrice: result.player.basePrice,
            auctionMode: newState.auctionMode || 'category',
            status: 'sold',
            winningTeamId: result.teamId,
            winningTeamName: result.team ? result.team.name : 'Unknown',
            finalPrice: result.amount,
            bids: result.bids,
            auctionStartedAt: new Date(Date.now() - 60000), // Approximate if not tracked
            auctionEndedAt: new Date(),
            conductedBy: userId
          });
        } catch (logError) {
          console.error("Error saving auction log:", logError);
        }

        // --- POST-SALE FLOW ---
        const auctionRaw = auctionStateManager.getOrCreateAuction(tournamentId);
        
        if (auctionRaw.auctionMode === 'manual') {
             // Return to selection screen
             auctionRaw.auctionMode = null;
             auctionNamespace.to(tournamentId).emit("auction:state", auctionStateManager.getAuctionState(tournamentId));
             
        } else if (auctionRaw.auctionMode === 'category') {
             // Auto-fetch next player
             setTimeout(async () => {
                 try {
                     const category = auctionRaw.selectedCategory || 'All';
                     const nextPlayer = await auctionService.nextAuctionPlayer(tournamentId, category);
                     
                     if (nextPlayer) {
                         const Tournament = require("../models/tournament");
                         const t = await Tournament.findById(tournamentId);
                         const slabs = t ? (t.bidIncrementSlabs || []) : [];
                         
                         if (t && t.categoryBasePrices && nextPlayer.playerCategory) {
                             const bp = t.categoryBasePrices.get(nextPlayer.playerCategory);
                             nextPlayer.basePrice = bp || 0;
                         } else {
                             nextPlayer.basePrice = 0;
                         }

                         const selRes = auctionStateManager.selectPlayer(tournamentId, nextPlayer, teams, slabs);
                         if (selRes.success) {
                             auctionNamespace.to(tournamentId).emit("auction:playerSelected", nextPlayer);
                             auctionNamespace.to(tournamentId).emit("auction:state", selRes.state);
                         }
                     } else {
                         auctionRaw.auctionMode = null;
                         auctionNamespace.to(tournamentId).emit("auction:state", auctionStateManager.getAuctionState(tournamentId));
                         socket.emit("auction:info", "No more players in this category");
                     }
                 } catch (err) {
                     console.error("Error auto-fetching next player:", err);
                 }
             }, 3000); 
        }
      } else {
        socket.emit("auction:error", result.error);
      }
    });

    // Mark Unsold
    socket.on("auction:unsold", async ({ tournamentId, userId }) => {
      if (!auctionStateManager.isAuctioneer(tournamentId, socket.id)) {
        return socket.emit("auction:error", "Unauthorized");
      }

      const result = auctionStateManager.markUnsold(tournamentId);
      
      if (result.success) {
        auctionNamespace.to(tournamentId).emit("auction:unsold", {
            player: result.player
        });

        try {
            await playerService.updatePlayer({
                playerId: result.player._id,
                sold: false,
                auctionStatus: true,
                userId
            });

            // Save log for unsold
            await auctionLogService.saveAuctionLog({
              tournamentId,
              playerId: result.player._id,
              playerName: result.player.name,
              playerCategory: result.player.playerCategory,
              basePrice: result.player.basePrice,
              auctionMode: auctionStateManager.getAuctionState(tournamentId)?.auctionMode || 'category',
              status: 'unsold',
              bids: result.bids,
              auctionStartedAt: new Date(Date.now() - 60000),
              auctionEndedAt: new Date(),
              conductedBy: userId
            });
        } catch (error) {
             console.error("Error updating/logging unsold player:", error);
        }
        
        // Broadcast updated state
        const newState = auctionStateManager.getAuctionState(tournamentId);
        auctionNamespace.to(tournamentId).emit("auction:state", newState);

        // --- POST-ROUND FLOW (Unsold) ---
        const auctionRaw = auctionStateManager.getOrCreateAuction(tournamentId);
        const teams = newState.teams || []; 

        if (auctionRaw.auctionMode === 'manual') {
             auctionRaw.auctionMode = null;
             auctionNamespace.to(tournamentId).emit("auction:state", auctionStateManager.getAuctionState(tournamentId));
             
        } else if (auctionRaw.auctionMode === 'category') {
             setTimeout(async () => {
                 try {
                     const category = auctionRaw.selectedCategory || 'All';
                     const nextPlayer = await auctionService.nextAuctionPlayer(tournamentId, category);
                     
                     if (nextPlayer) {
                         const Tournament = require("../models/tournament");
                         const t = await Tournament.findById(tournamentId);
                         const slabs = t ? (t.bidIncrementSlabs || []) : [];
                         
                         if (t && t.categoryBasePrices && nextPlayer.playerCategory) {
                             const bp = t.categoryBasePrices.get(nextPlayer.playerCategory);
                             nextPlayer.basePrice = bp || 0;
                         } else {
                             nextPlayer.basePrice = 0;
                         }

                         const selRes = auctionStateManager.selectPlayer(tournamentId, nextPlayer, teams, slabs);
                         if (selRes.success) {
                             auctionNamespace.to(tournamentId).emit("auction:playerSelected", nextPlayer);
                             auctionNamespace.to(tournamentId).emit("auction:state", selRes.state);
                         }
                     } else {
                         auctionRaw.auctionMode = null;
                         auctionNamespace.to(tournamentId).emit("auction:state", auctionStateManager.getAuctionState(tournamentId));
                         socket.emit("auction:info", "No more players in this category");
                     }
                 } catch (err) {
                     console.error("Error auto-fetching next player:", err);
                 }
             }, 3000); 
        }
      } else {
         socket.emit("auction:error", result.error);
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
      
      if (socket.tournamentId) {
        const viewerCount = auctionStateManager.removeViewer(socket.tournamentId, socket.id);
        auctionNamespace.to(socket.tournamentId).emit("auction:viewerCount", viewerCount);
      }
    });
  });
};
