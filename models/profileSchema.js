const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userID: { type: String, require: true, unique: true },
  serverID: { type: String, require: true },
  balance: { type: Number, default: 100 },
  coinFlipLastUsed: { type: Number, default: 0 },
  rouletteLastUsed: { type: Number, default: 0 },
  spinLastUsed: { type: Number, default: 0 },
});

const model = mongoose.model("ecodb", profileSchema);

module.exports = model;
