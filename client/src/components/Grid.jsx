"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { socket } from "../lib/socket";
import { motion } from "framer-motion";

const colors = [
  "#ef4444",
  "#3b82f6",
  "#22c55e",
  "#eab308",
  "#a855f7",
  "#f97316",
];

export default function Grid() {
  const [tiles, setTiles] = useState([]);
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [userColor, setUserColor] = useState("");
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setUserColor(randomColor);
  }, []);

  useEffect(() => {
    fetchTiles();

    socket.on("tile-updated", (updatedTile) => {
      setTiles((prev) =>
        prev.map((tile) =>
          tile.index === updatedTile.index ? updatedTile : tile
        )
      );
    });

    socket.on("online-users", (count) => {
      setOnlineUsers(count);
    });
    socket.on("claim-error", (data) => {
      setMessage(data.message);

      setTimeout(() => {
        setMessage("");
      }, 2000);
    });
    socket.on("board-reset", (resetTiles) => {
  setTiles(resetTiles);
});

    return () => {
      socket.off("tile-updated");
      socket.off("online-users");
      socket.off("claim-error");
      socket.off("board-reset");
    };
  }, []);

  const fetchTiles = async () => {
    const res = await axios.get(
  `${process.env.NEXT_PUBLIC_API_URL}/api/tiles`
);
    setTiles(res.data);
  };

  const handleJoin = () => {
    if (!username.trim()) return;
    socket.connect();
    setJoined(true);
  };

  const claimTile = (index) => {
    socket.emit("claim-tile", {
      tileIndex: index,
      ownerName: username,
      ownerColor: userColor,
    });
  };


  const claimedTiles = tiles.filter((tile) => tile.ownerName).length;

  const leaderboard = useMemo(() => {
    return Object.values(
      tiles.reduce((acc, tile) => {
        if (!tile.ownerName) return acc;

        if (!acc[tile.ownerName]) {
          acc[tile.ownerName] = {
            name: tile.ownerName,
            color: tile.ownerColor,
            count: 0,
          };
        }

        acc[tile.ownerName].count += 1;
        return acc;
      }, {})
    ).sort((a, b) => b.count - a.count);
  }, [tiles]);

  if (!joined) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white px-4">
        <div className="bg-zinc-900 p-8 rounded-2xl w-full max-w-md border border-zinc-800 shadow-2xl">
          <h1 className="text-5xl font-bold mb-3">Grid Capture</h1>

          <p className="text-zinc-400 mb-8">
            Join the realtime battlefield.
          </p>

          <input
            type="text"
            placeholder="Enter your name"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-4 outline-none focus:border-white transition"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <button
            onClick={handleJoin}
            className="w-full mt-4 bg-white text-black font-semibold rounded-xl py-4 hover:bg-zinc-200 transition"
          >
            Join Board
          </button>
        </div>
      </div>
    );
  }
  const resetBoard = async () => {
  try {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/reset`);

    setTiles(res.data.tiles);
  } catch (error) {
    console.log(error);
  }
};

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold">Realtime Grid</h1>
            <p className="text-zinc-400 mt-2">Logged in as {username}</p>
          </div>
          

          <div className="flex gap-4">
            <button
  onClick={resetBoard}
  className="bg-red-500/10 border border-red-500/40 text-red-300 rounded-xl px-5 py-4 hover:bg-red-500/20 transition"
>
  Reset Board
</button>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4">
              
              <p className="text-sm text-zinc-400">Online Players</p>
              <p className="text-2xl font-bold text-green-400">
                {onlineUsers}
              </p>
            </div>
            

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4">
              <p className="text-sm text-zinc-400">Your Color</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: userColor }}
                />
                <span className="font-semibold">{userColor}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
>
  <p className="text-zinc-400 text-sm">Total Tiles</p>
  <p className="text-2xl font-bold">{tiles.length}</p>
</motion.div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-400 text-sm">Claimed</p>
            <p className="text-2xl font-bold">{claimedTiles}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-400 text-sm">Available</p>
            <p className="text-2xl font-bold">{tiles.length - claimedTiles}</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
          <h2 className="text-xl font-semibold mb-3">Leaderboard</h2>

          {leaderboard.length === 0 ? (
            <p className="text-zinc-500">No tiles claimed yet.</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((player, index) => (
                <div
                  key={player.name}
                  className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400">#{index + 1}</span>
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: player.color }}
                    />
                    <span>{player.name}</span>
                  </div>

                  <span className="font-semibold">{player.count} tiles</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {message && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300">
            {message}
          </div>
        )}

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 overflow-auto">

          <div
  className="grid gap-1 min-w-[700px]"
  style={{
    gridTemplateColumns: "repeat(20, minmax(0, 1fr))",
  }}
>
            {tiles.map((tile) => (
              <motion.button
  key={tile.index}
  onClick={() => claimTile(tile.index)}
  disabled={Boolean(tile.ownerName)}
  whileHover={!tile.ownerName ? { scale: 1.08 } : {}}
  whileTap={!tile.ownerName ? { scale: 0.95 } : {}}
  animate={{
    scale: tile.ownerName ? [1, 1.15, 1] : 1,
  }}
  transition={{ duration: 0.25 }}
  className="aspect-square rounded-md cursor-pointer border border-zinc-900 disabled:cursor-not-allowed"
  style={{
    backgroundColor: tile.ownerColor || "#18181b",
  }}
  title={tile.ownerName ? `Owned by ${tile.ownerName}` : "Unclaimed"}
/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}