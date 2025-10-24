# API Routes Implementation Status

This document tracks which controller methods need to be created or updated based on the new route structure.

## ✅ Already Implemented

### Team Controller
- ✅ `addTeam` → Used for `/team/register`
- ✅ `teamReport` → Used for `/team/all` (was `getTournamentTeamsReport`)
- ✅ `individualTeamReport` → Used for `/team/detail` (was `getTeamReport`)

### Player Controller
- ✅ `registerPlayer` → Used for `/player/register`
- ✅ `playerReport` → Used for `/player/all`
- ✅ `updatePlayer` → Used for `/player/update`
- ✅ `deletePlayer` → Used for `/player/delete`

### Tournament Controller
- ✅ `addTournamnet` → Used for `/tournament/register`
- ✅ `getAllTournaments` → Used for `/tournament/all`

### User Controller
- ✅ `adduser` → Used for `/user/register`
- ✅ `login` → Used for `/user/login`

### Auction Controller
- ✅ `playerCategories` → Used for `/auction/player-categories`

---

## ⚠️ Needs to be Implemented/Updated

### Team Controller (`teamController.js`)

#### 1. `updateTeam` - NEW
**Route:** `POST /team/update`
**Purpose:** Update team information (name, logo, budget, etc.)
```javascript
updateTeam: async (req, res) => {
  const { teamId, name, logo, owner } = req.body;
  // Implementation needed
}
```

#### 2. `getTeamNames` - NEW
**Route:** `POST /team/names`
**Purpose:** Get only team IDs and names (lightweight query)
```javascript
getTeamNames: async (req, res) => {
  const { touranmentId } = req.body;
  // Return only _id and name fields
}
```

#### 3. `getTeamNamesAndBudget` - NEW
**Route:** `POST /team/names-budget`
**Purpose:** Get team names with budget information
```javascript
getTeamNamesAndBudget: async (req, res) => {
  const { touranmentId } = req.body;
  // Return _id, name, totalBudget, remainingBudget
}
```

---

### Player Controller (`playerController.js`)

#### 1. `getPlayerDetail` - NEW
**Route:** `POST /player/detail`
**Purpose:** Get individual player details by ID
```javascript
getPlayerDetail: async (req, res) => {
  const { playerId } = req.body;
  // Return complete player information
}
```

#### 2. `getPlayerCategories` - NEW
**Route:** `POST /player/categories`
**Purpose:** Get distinct player categories in a tournament
```javascript
getPlayerCategories: async (req, res) => {
  const { touranmentId } = req.body;
  // Return array of unique categories
}
```

---

### Tournament Controller (`touranmentController.js`)

#### 1. `getTournamentDetail` - NEW
**Route:** `POST /tournament/detail`
**Purpose:** Get individual tournament details
```javascript
getTournamentDetail: async (req, res) => {
  const { tournamentId } = req.body;
  // Return complete tournament information
}
```

#### 2. `updateTournament` - NEW
**Route:** `POST /tournament/update`
**Purpose:** Update tournament information
```javascript
updateTournament: async (req, res) => {
  const { tournamentId, name, startDate, endDate, budget } = req.body;
  // Implementation needed
}
```

---

### Tournament Host Controller (`tournamentHostController.js`)

#### 1. `login` - NEW
**Route:** `POST /touranmentHost/login`
**Purpose:** Authenticate tournament host
```javascript
login: async (req, res) => {
  const { email, password } = req.body;
  // Verify credentials and return token
}
```

---

### User Controller (`userController.js`)

#### 1. `getUserDetail` - NEW
**Route:** `POST /user/detail`
**Purpose:** Get individual user details
```javascript
getUserDetail: async (req, res) => {
  const { userId } = req.body;
  // Return user information
}
```

---

### Auction Controller (`auctionController.js`)

#### 1. `getNextAuctionPlayer` - UPDATE (was `nextAuctionPlayer` in playerController)
**Route:** `POST /auction/next-player`
**Purpose:** Get next player for auction
**Status:** Exists in `playerController`, needs to be moved/aliased
```javascript
getNextAuctionPlayer: async (req, res) => {
  const { touranmentId, playerCategory } = req.body;
  // Return next unsold player matching criteria
}
```

#### 2. `notifyPlayerAuctionStatus` - NEW
**Route:** `POST /auction/notify-player-status`
**Purpose:** Send WhatsApp notification about player auction status
```javascript
notifyPlayerAuctionStatus: async (req, res) => {
  const { playerId, playerName, teamName, soldAmount, recipientNumber } = req.body;
  // Use whatsappNotification utility
}
```

#### 3. `notifyTeamAuctionStatus` - NEW
**Route:** `POST /auction/notify-team-status`
**Purpose:** Send WhatsApp notification to team
```javascript
notifyTeamAuctionStatus: async (req, res) => {
  const { teamId, teamName, message, recipientNumber } = req.body;
  // Use whatsappNotification utility
}
```

---

## 🔄 Controller Method Mapping

### OLD → NEW Naming Convention

| Old Endpoint | New Endpoint | Controller Method |
|-------------|-------------|-------------------|
| `/player/deletePlayer` | `/player/delete` | `deletePlayer` |
| `/player/updatePlayer` | `/player/update` | `updatePlayer` |
| `/player/player_report` | `/player/all` | `playerReport` |
| `/player/nextAuctionPlayer` | `/auction/next-player` | `getNextAuctionPlayer` |
| `/team/report` | `/team/all` | `teamReport` |
| `/team/individual_report` | `/team/detail` | `individualTeamReport` |
| `/auction/playerCategories` | `/auction/player-categories` | `playerCategories` |
| `/user/` | `/user/register` | `adduser` |
| `/tournament/` | `/tournament/register` | `addTournamnet` |

---

## 📋 Implementation Priority

### High Priority (Core Functionality)
1. ✅ `getNextAuctionPlayer` - Move from playerController to auctionController
2. ⚠️ `getPlayerDetail` - Needed for player modal
3. ⚠️ `getTeamNames` - Needed for dropdowns
4. ⚠️ `updateTeam` - Needed for team management

### Medium Priority (Enhanced Features)
5. ⚠️ `getTeamNamesAndBudget` - Needed for auction UI
6. ⚠️ `getPlayerCategories` - Needed for filtering
7. ⚠️ `getTournamentDetail` - Needed for tournament view
8. ⚠️ `getUserDetail` - Needed for user profile

### Low Priority (Administrative)
9. ⚠️ `updateTournament` - Admin functionality
10. ⚠️ `tournamentHostLogin` - Authentication

### Future Enhancement (Notifications)
11. ⚠️ `notifyPlayerAuctionStatus` - WhatsApp integration
12. ⚠️ `notifyTeamAuctionStatus` - WhatsApp integration

---

## 🚀 Next Steps

1. **Move `nextAuctionPlayer`** from `playerController` to `auctionController` as `getNextAuctionPlayer`
2. **Implement NEW methods** marked with ⚠️ above
3. **Update frontend API calls** to use new endpoint names
4. **Test all endpoints** with proper request/response validation
5. **Add authentication middleware** where needed
6. **Document any breaking changes** for frontend team

---

## 📝 Notes

- All new methods should follow the existing error handling pattern
- Use consistent response format across all endpoints
- Add input validation for all new methods
- Consider adding rate limiting for WhatsApp notification endpoints
- Tournament ID is consistently spelled as `touranmentId` (maintain this for backward compatibility)

---

**Last Updated:** 22 October 2025
**Status:** Routes Reorganized, Implementation Pending
