const { SlashCommandBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");
const { coinFlipReward } = require("../globalValues.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roulette")
    .setDescription(
      "Test your luck at the roulette table! Win up to 7x your bet"
    )
    .addStringOption((option) =>
      option
        .setName("choice")
        .setDescription("What spot do you want to bet on?")
        .setRequired(true)
        .addChoices(
          { name: "Odds", value: "odds" },
          { name: "Evens", value: "evens" },
          { name: "1", value: "1" },
          { name: "2", value: "2" },
          { name: "3", value: "3" },
          { name: "4", value: "4" },
          { name: "5", value: "5" },
          { name: "6", value: "6" },
          { name: "7", value: "7" },
          { name: "8", value: "8" },
          { name: "9", value: "9" },
          { name: "10", value: "10" },
          { name: "11", value: "11" },
          { name: "12", value: "12" },
          { name: "13", value: "13" },
          { name: "14", value: "14" },
          { name: "15", value: "15" },
          { name: "16", value: "16" },
          { name: "17", value: "17" },
          { name: "18", value: "18" },
          { name: "19", value: "19" },
          { name: "20", value: "20" },
          { name: "21", value: "21" },
          { name: "22", value: "22" },
          { name: "23", value: "23" }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Heads or Tails")
        .setRequired(true)
        .setMinValue(100)
    ),
  async execute(interaction, profileData) {
    await interaction.deferReply();
    const { id } = interaction.user;
    const bet = interaction.options.getInteger("amount");
    const cooldown = 600000; //10 minute (maybe?)

    // Fetch the user's profile to get the last used time
    let userProfile = await profileModel.findOne({ userID: id });

    if (!userProfile) {
      userProfile = new profileModel({
        userID: id,
        rouletteLastUsed: 0,
        balance: 0,
      });
    }

    const rouletteLastUsed = userProfile.rouletteLastUsed || 0;

    const timeLeft = rouletteLastUsed - Date.now() + cooldown;
    if (timeLeft > 0) {
      return await interaction.editReply(
        `You can play roulette again in <t:${Math.floor(
          (rouletteLastUsed + cooldown) / 1000
        )}:R>`
      );
    }

    await profileModel.findOneAndUpdate(
      {
        userID: id,
      },
      {
        $set: {
          rouletteLastUsed: Date.now(),
        },
      }
    );

    const randomNum = Math.floor(Math.random() * 26) + 1; // Random number between 1 and 36
    const isEven = randomNum % 2 == 0;
    const choice = interaction.options.getString("choice");

    let win = false;
    switch (choice) {
      case "evens":
        if (isEven) win = true;
        break;
      case "odds":
        if (!isEven) win = true;
        break;
      default:
        let number = Number(choice);
        if (number === randomNum) win = true;
        break;
    }

    if (win) {
      await profileModel.findOneAndUpdate(
        { userID: id },
        { $inc: { balance: bet * 7 } }
      );

      await interaction.editReply(
        `You won ${bet * 7} coins with **${choice}**!`
      );
    } else {
      await profileModel.findOneAndUpdate(
        { userID: id },
        { $inc: { balance: -bet } }
      );
      await interaction.editReply(
        `Lost... You chose **${choice}** but it was **${randomNum}**.`
      );
    }
  },
};
