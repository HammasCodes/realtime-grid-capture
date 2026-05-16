# Realtime Grid Capture

Realtime Grid Capture is a multiplayer web application where users can join a shared board and capture tiles in real time. Every action is synchronized instantly across all connected clients using WebSockets.

The project was built to focus on realtime architecture, backend conflict handling, multiplayer synchronization, and interactive UI design.

---

## Overview

The application displays a shared grid made up of hundreds of tiles. Users can join the board with a username and claim available tiles. Once a tile is captured, the update is immediately reflected for all connected users.

The system handles:

- Realtime synchronization
- Persistent tile ownership
- Multiplayer updates
- Conflict prevention
- Cooldown handling
- Leaderboard tracking

---

## Features

- Realtime multiplayer tile claiming
- Shared live grid board
- MongoDB persistence
- Socket.IO based realtime updates
- Online users counter
- Leaderboard system
- Claim cooldown handling
- Reset board functionality
- Responsive UI
- Smooth animations using Framer Motion

---

## Tech Stack

### Frontend

- Next.js
- React
- Tailwind CSS
- Framer Motion
- Axios
- Socket.IO Client

### Backend

- Node.js
- Express.js
- Socket.IO
- MongoDB
- Mongoose

---

## How Realtime Updates Work

The application uses Socket.IO to maintain a persistent websocket connection between the server and connected clients.

When a user claims a tile:

1. The frontend emits a `claim-tile` event
2. The backend validates ownership and cooldown rules
3. MongoDB updates the tile ownership
4. The backend broadcasts the updated tile using `tile-updated`
5. All connected clients instantly update their UI

This ensures that every connected user sees changes in real time without refreshing the page.

---

## Database Structure

Each tile document stores:

```js
{
  index: Number,
  ownerId: String,
  ownerName: String,
  ownerColor: String
}
```

The grid is initialized automatically when the server starts for the first time.

---

## Trade-offs and Decisions

### Simplicity vs Scalability

The current implementation prioritizes clarity and simplicity for development speed while still keeping the architecture scalable enough for expansion.

### Realtime Conflict Handling

Tile ownership conflicts are handled directly on the backend using atomic database updates. This prevents multiple users from claiming the same tile simultaneously.

### Cooldown System

A lightweight in-memory cooldown system was used instead of Redis to keep the implementation simple for the assignment.

### UI Decisions

The interface was intentionally kept minimal and dark-themed to focus on clarity and responsiveness.

---

## Project Structure

```bash
realtime-grid-capture/
│
├── client/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   │
│   └── package.json
│
├── server/
│   ├── models/
│   ├── index.js
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## Local Setup

### Clone the repository

```bash
git clone <repo-url>
cd realtime-grid-capture
```

---

## Backend Setup

```bash
cd server
npm install
```

Create `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:3000
```

Run backend:

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs on:

```txt
http://localhost:3000
```

Backend runs on:

```txt
http://localhost:5000
```

---

## Core Functionalities

### Multiplayer Tile Claiming

Users can claim unowned tiles on the shared board. Ownership updates are broadcast instantly to every connected client.

### Leaderboard

The leaderboard dynamically tracks which users own the most tiles.

### Cooldown Protection

Users cannot spam tile captures continuously. A cooldown mechanism prevents excessive requests.

### Online User Tracking

The application tracks connected users in realtime using Socket.IO events.

### Reset Board

The board can be reset instantly during development and testing.

---

## Future Improvements

- Zoom and pan support
- Tile ownership timer
- Area control mechanics
- User authentication
- Persistent player profiles
- Redis-based scaling
- Docker deployment


Deployment

Frontend can be deployed on:

Vercel
Netlify

Backend can be deployed on:

Render
Railway
VPS

MongoDB database can be hosted using MongoDB Atlas.

Author

Mohammad Hammas Ansari