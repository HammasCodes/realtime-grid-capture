const mongoose = require("mongoose");

const tileSchema = new mongoose.Schema(
  {
    index: {
      type: Number,
      required: true,
      unique: true,
    },
    ownerId: {
      type: String,
      default: null,
    },
    ownerName: {
      type: String,
      default: null,
    },
    ownerColor: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tile", tileSchema);