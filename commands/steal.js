const { SlashCommandBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("steal")
    .setDescription("steal from a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to steal from")
        .setRequired(true)
    ),
  async execute(interaction, profileData) {
    const { id } = interaction.user;
    const user = interaction.options.getUser("user");

    await interaction.deferReply();

    let userData = await profileModel.findOne({ userID: user.id });

    let works = Math.floor(Math.random() * 11) <= 2; // 20% chance it works at all

    if (!works) {
      await interaction.editReply(
        `You got caught while trying to steal from <@!${user.id}>!`
      );
      return;
    }

    let amount = Math.floor(Math.random() * 10) + 1; // 1-10% amount of money
    let amount_val = Math.floor(userData.balance * (amount / 10));
    console.log(amount, amount_val);
    try {
      await profileModel.findOneAndUpdate(
        { userID: id }, // Ensure the update is applied to the correct user
        {
          $inc: { balance: amount_val },
        }
      );
      await profileModel.findOneAndUpdate(
        { userID: user.id },
        {
          $inc: { balance: -amount_val },
        }
      );
    } catch (error) {
      console.log(error);
    }

    await interaction.editReply(`You stole ${amount_val} from <@!${user.id}>`);
  },
};
