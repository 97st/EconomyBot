const { SlashCommandBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");
const { coinFlipReward } = require("../globalValues.json");
const parseMilliSeconds = require("parse-ms-2");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Flip a coin and win money")
    .addStringOption((option) =>
      option
        .setName("choice")
        .setDescription("Heads or Tails")
        .setRequired(true)
        .addChoices(
          { name: "Heads", value: "Heads" },
          { name: "Tails", value: "Tails" }
        )
    ),
  async execute(interaction, profileData) {
    const { id } = interaction.user;
    const cooldown = 3600000; //1 hour cooldown

    // Fetch the user's profile to get the last used time
    let userProfile = await profileModel.findOne({ userID: id });

    if (!userProfile) {
      userProfile = new profileModel({
        userID: id,
        coinFlipLastUsed: 0,
        balance: 0,
      });
    }

    const coinFlipLastUsed = userProfile.coinFlipLastUsed || 0;
    const timeLeft = cooldown - (Date.now() - coinFlipLastUsed);

    if (timeLeft > 0) {
      await interaction.deferReply({ ephemeral: true });
      const { minutes, seconds } = parseMilliSeconds(timeLeft);
      return await interaction.editReply(
        `Claim your next coinflip in ${minutes} min ${seconds} sec`
      );
    }

    await interaction.deferReply();

    await profileModel.findOneAndUpdate(
      {
        userID: id,
      },
      {
        $set: {
          coinFlipLastUsed: Date.now(),
        },
      }
    );

    const randomNum = Math.round(Math.random()); // Random number between 0 and 1
    const result = randomNum == 1 ? "Heads" : "Tails";
    const choice = interaction.options.getString("choice");

    if (choice === result) {
      await profileModel.findOneAndUpdate(
        { userID: id },
        { $inc: { balance: coinFlipReward } }
      );

      await interaction.editReply(
        `You won ${coinFlipReward} coins with **${choice}**!`
      );
    } else {
      await interaction.editReply(
        `Lost... You chose **${choice}** but it was **${result}**.`
      );
    }
  },
};
