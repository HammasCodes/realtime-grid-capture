require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const Tile = require("./models/Tile");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const GRID_SIZE = 400;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  })
);

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

async function initializeGrid() {
  const count = await Tile.countDocuments();

  if (count === 0) {
    const tiles = [];

    for (let i = 0; i < GRID_SIZE; i++) {
      tiles.push({
        index: i,
        ownerId: null,
        ownerName: null,
        ownerColor: null,
      });
    }

    await Tile.insertMany(tiles);
    console.log("Grid initialized with 400 tiles");
  }
}

app.get("/", (req, res) => {
  res.send("Realtime Grid Backend Running");
});

app.get("/api/tiles", async (req, res) => {
  try {
    const tiles = await Tile.find().sort({ index: 1 });
    res.json(tiles);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tiles",
    });
  }
});
app.post("/api/reset", async (req, res) => {
  try {
    await Tile.updateMany(
      {},
      {
        ownerId: null,
        ownerName: null,
        ownerColor: null,
      }
    );

    const tiles = await Tile.find().sort({ index: 1 });

    io.emit("board-reset", tiles);

    res.json({
      message: "Board reset successfully",
      tiles,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reset board",
    });
  }
});

let onlineUsers = 0;
const claimCooldowns = new Map();
const COOLDOWN_MS = 2000;

io.on("connection", (socket) => {
  onlineUsers++;
  io.emit("online-users", onlineUsers);

  console.log("User connected:", socket.id);

  socket.on("claim-tile", async ({ tileIndex, ownerName, ownerColor }) => {
    const now = Date.now();
  const lastClaim = claimCooldowns.get(socket.id) || 0;

  if (now - lastClaim < COOLDOWN_MS) {
    socket.emit("claim-error", {
      message: "Please wait before claiming another tile.",
    });
    return;
  }

  claimCooldowns.set(socket.id, now);
    try {
      const updatedTile = await Tile.findOneAndUpdate(
        {
          index: tileIndex,
          ownerId: null,
        },
        {
          ownerId: socket.id,
          ownerName,
          ownerColor,
        },
        {
          new: true,
        }
      );

      if (!updatedTile) {
        socket.emit("claim-error", {
          message: "This tile is already claimed.",
        });
        return;
      }

      io.emit("tile-updated", updatedTile);
    } catch (error) {
      socket.emit("claim-error", {
        message: "Failed to claim tile.",
      });
    }
  });

  socket.on("disconnect", () => {
    onlineUsers--;
    io.emit("online-users", onlineUsers);
    claimCooldowns.delete(socket.id);

    console.log("User disconnected:", socket.id);
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await initializeGrid();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });