# Auctioner API Documentation

## Base URL
```
http://localhost:3000/api
```

---

## 📋 Table of Contents
1. [Tournament Host APIs](#tournament-host-apis)
2. [User APIs](#user-apis)
3. [Tournament APIs](#tournament-apis)
4. [Team APIs](#team-apis)
5. [Player APIs](#player-apis)
6. [Auction APIs](#auction-apis)

---

## 🏆 Tournament Host APIs

### 1. Register Tournament Host
**Endpoint:** `POST /touranmentHost/register`

**Description:** Register a new tournament host

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "9876543210",
  "password": "securePassword123"
}
```

### 2. Login as a Host
**Endpoint:** `POST /touranmentHost/login`

**Description:** Authenticate tournament host

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

---

## 👤 User APIs

### 1. Register User
**Endpoint:** `POST /user/register`

**Description:** Register a new user/team owner

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "mobile": "9876543210",
  "password": "password123"
}
```

### 2. User Login
**Endpoint:** `POST /user/login`

**Description:** Authenticate user

**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

### 3. Get User Details
**Endpoint:** `POST /user/detail`

**Description:** Get individual user details

**Request Body:**
```json
{
  "userId": "60d5ec49f1b2c72b8c8e4f1a"
}
```

---

## 🏟️ Tournament APIs

### 1. Register New Tournament
**Endpoint:** `POST /tournament/register`

**Description:** Create a new tournament

**Request Body:**
```json
{
  "name": "IPL 2025",
  "startDate": "2025-03-15",
  "endDate": "2025-05-30",
  "teams": 8,
  "playersPerTeam": 15,
  "budget": 100000
}
```

### 2. Get All Tournaments
**Endpoint:** `GET /tournament/all`

**Description:** Retrieve list of all tournaments

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f1a",
      "name": "IPL 2025",
      "startDate": "2025-03-15",
      "teams": 8
    }
  ]
}
```

### 3. Get Individual Tournament Detail
**Endpoint:** `POST /tournament/detail`

**Description:** Get details of a specific tournament

**Request Body:**
```json
{
  "tournamentId": "60d5ec49f1b2c72b8c8e4f1a"
}
```

### 4. Update Tournament
**Endpoint:** `POST /tournament/update`

**Description:** Update tournament details

**Request Body:**
```json
{
  "tournamentId": "60d5ec49f1b2c72b8c8e4f1a",
  "name": "IPL 2025 Updated",
  "budget": 120000
}
```

---

## 🏏 Team APIs

### 1. Register New Team
**Endpoint:** `POST /team/register`

**Description:** Register a new team in a tournament

**Request Body:**
```json
{
  "name": "Mumbai Indians",
  "logo": "https://example.com/logo.png",
  "touranmentId": "60d5ec49f1b2c72b8c8e4f1a",
  "owner": {
    "name": "Mukesh Ambani",
    "email": "owner@mi.com",
    "mobile": "9876543210"
  },
  "totalBudget": 100000
}
```

### 2. Get All Team Details
**Endpoint:** `POST /team/all`

**Description:** Get all teams in a tournament

**Request Body:**
```json
{
  "touranmentId": "60d5ec49f1b2c72b8c8e4f1a"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f2b",
      "name": "Mumbai Indians",
      "logo": "https://example.com/logo.png",
      "totalBudget": 100000,
      "remainingBudget": 75000,
      "playersCount": 5
    }
  ]
}
```

### 3. Get Individual Team Detail
**Endpoint:** `POST /team/detail`

**Description:** Get detailed information of a specific team

**Request Body:**
```json
{
  "teamId": "60d5ec49f1b2c72b8c8e4f2b"
}
```

### 4. Update Individual Team
**Endpoint:** `POST /team/update`

**Description:** Update team information

**Request Body:**
```json
{
  "teamId": "60d5ec49f1b2c72b8c8e4f2b",
  "name": "Mumbai Indians Updated",
  "logo": "https://example.com/new-logo.png"
}
```

### 5. Get All Team Names
**Endpoint:** `POST /team/names`

**Description:** Get list of team names only (lightweight)

**Request Body:**
```json
{
  "touranmentId": "60d5ec49f1b2c72b8c8e4f1a"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f2b",
      "name": "Mumbai Indians"
    },
    {
      "_id": "60d5ec49f1b2c72b8c8e4f2c",
      "name": "Chennai Super Kings"
    }
  ]
}
```

### 6. Get All Team Names and Budget
**Endpoint:** `POST /team/names-budget`

**Description:** Get team names with budget information

**Request Body:**
```json
{
  "touranmentId": "60d5ec49f1b2c72b8c8e4f1a"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f2b",
      "name": "Mumbai Indians",
      "totalBudget": 100000,
      "remainingBudget": 75000
    }
  ]
}
```

---

## 🎯 Player APIs

### 1. Register New Player
**Endpoint:** `POST /player/register`

**Description:** Register a new player for the auction

**Request Body:**
```json
{
  "name": "Virat Kohli",
  "age": 35,
  "photo": "https://example.com/virat.jpg",
  "mobile": 9876543210,
  "email": "virat@cricket.com",
  "address": "Delhi, India",
  "skills": ["Batsman"],
  "playerCategory": "Icon",
  "basePrice": 20000,
  "touranmentId": "60d5ec49f1b2c72b8c8e4f1a"
}
```

### 2. Get All Player Details
**Endpoint:** `POST /player/all`

**Description:** Get all players in a tournament

**Request Body:**
```json
{
  "touranmentId": "60d5ec49f1b2c72b8c8e4f1a"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f3a",
      "name": "Virat Kohli",
      "age": 35,
      "skills": ["Batsman"],
      "basePrice": 20000,
      "sold": true,
      "amtSold": 50000,
      "teamName": "Mumbai Indians"
    }
  ]
}
```

### 3. Get Individual Player Detail
**Endpoint:** `POST /player/detail`

**Description:** Get detailed information of a specific player

**Request Body:**
```json
{
  "playerId": "60d5ec49f1b2c72b8c8e4f3a"
}
```

### 4. Update Individual Player Details
**Endpoint:** `POST /player/update`

**Description:** Update player information

**Request Body:**
```json
{
  "playerId": "60d5ec49f1b2c72b8c8e4f3a",
  "name": "Virat Kohli",
  "age": 36,
  "sold": true,
  "auctionStatus": true,
  "amtSold": 50000,
  "teamId": "60d5ec49f1b2c72b8c8e4f2b"
}
```

### 5. Delete Player
**Endpoint:** `POST /player/delete`

**Description:** Delete a player from the tournament

**Request Body:**
```json
{
  "playerId": "60d5ec49f1b2c72b8c8e4f3a"
}
```

### 6. Get All Player Categories
**Endpoint:** `POST /player/categories`

**Description:** Get list of all player categories in a tournament

**Request Body:**
```json
{
  "touranmentId": "60d5ec49f1b2c72b8c8e4f1a"
}
```

**Response:**
```json
{
  "success": true,
  "data": ["Regular", "Icon", "Youth"]
}
```

---

## 🎪 Auction APIs

### 1. Get New Player for Auction
**Endpoint:** `POST /auction/next-player`

**Description:** Get the next player to be auctioned based on category and status

**Request Body:**
```json
{
  "touranmentId": "60d5ec49f1b2c72b8c8e4f1a",
  "playerCategory": "Regular"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f3b",
    "name": "Rohit Sharma",
    "age": 36,
    "skills": ["Batsman"],
    "basePrice": 18000,
    "playerCategory": "Regular",
    "photo": "https://example.com/rohit.jpg"
  }
}
```

### 2. Get All Player Categories (for auction filtering)
**Endpoint:** `POST /auction/player-categories`

**Description:** Get distinct player categories for auction filtering

**Request Body:**
```json
{
  "touranmentId": "60d5ec49f1b2c72b8c8e4f1a"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "category": "Icon", "count": 8 },
    { "category": "Regular", "count": 50 },
    { "category": "Youth", "count": 15 }
  ]
}
```

### 3. WhatsApp Player Auction Status
**Endpoint:** `POST /auction/notify-player-status`

**Description:** Send WhatsApp notification about player auction status

**Request Body:**
```json
{
  "playerId": "60d5ec49f1b2c72b8c8e4f3a",
  "playerName": "Virat Kohli",
  "teamName": "Mumbai Indians",
  "soldAmount": 50000,
  "recipientNumber": "919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "WhatsApp notification sent successfully",
  "messageId": "wamid.xxx"
}
```

### 4. WhatsApp Team Auction Status
**Endpoint:** `POST /auction/notify-team-status`

**Description:** Send WhatsApp notification to team about auction status

**Request Body:**
```json
{
  "teamId": "60d5ec49f1b2c72b8c8e4f2b",
  "teamName": "Mumbai Indians",
  "message": "Player successfully acquired!",
  "recipientNumber": "919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "WhatsApp notification sent to team",
  "messageId": "wamid.xxx"
}
```

---

## 📝 Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## 🔐 Authentication

Most endpoints require authentication. Include the authentication token in the header:

```
Authorization: Bearer <token>
```

---

## 📌 Notes

1. All `POST` requests require `Content-Type: application/json` header
2. Date formats should be in ISO 8601 format (YYYY-MM-DD)
3. Phone numbers should include country code (e.g., 919876543210)
4. All IDs are MongoDB ObjectIDs
5. Tournament ID is spelled as `touranmentId` (note the spelling) throughout the API

---

## 🚀 API Route Structure

```
/api
├── /touranmentHost
│   ├── POST /register          - Register Tournament Host
│   └── POST /login             - Login as Host
├── /user
│   ├── POST /register          - Register User
│   ├── POST /login             - User Login
│   └── POST /detail            - Get User Details
├── /tournament
│   ├── POST /register          - Register New Tournament
│   ├── GET  /all               - Get All Tournaments
│   ├── POST /detail            - Get Tournament Detail
│   └── POST /update            - Update Tournament
├── /team
│   ├── POST /register          - Register New Team
│   ├── POST /all               - Get All Team Details
│   ├── POST /detail            - Get Individual Team Detail
│   ├── POST /update            - Update Individual Team
│   ├── POST /names             - Get All Team Names
│   └── POST /names-budget      - Get Team Names and Budget
├── /player
│   ├── POST /register          - Register New Player
│   ├── POST /all               - Get All Player Details
│   ├── POST /detail            - Get Individual Player Detail
│   ├── POST /update            - Update Individual Player
│   ├── POST /delete            - Delete Player
│   └── POST /categories        - Get All Player Categories
└── /auction
    ├── POST /next-player            - Get Next Auction Player
    ├── POST /player-categories      - Get Player Categories
    ├── POST /notify-player-status   - WhatsApp Player Status
    └── POST /notify-team-status     - WhatsApp Team Status
```

---

**Last Updated:** 22 October 2025
**API Version:** 1.0.0
