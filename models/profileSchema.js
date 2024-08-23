const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    userID: { type: String, require: true, unique: true },
    serverID: { type: String, require: true },
    balance: { type: Number, default: 100 },
    dailyLastUsed: { type: Number, default: 0 },
    coinFlipLastUsed: { type: Number, default: 0 },
});

const model = mongoose.model("ecodb", profileSchema);

module.exports = model;
