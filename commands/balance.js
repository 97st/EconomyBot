const { SlashCommandBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("check your balance")
    .addUserOption((option) =>
      option.setName("user").setDescription("the user you want to donate to")
    ),
  async execute(interaction, profileData) {
    let user = interaction.options.getUser("user");
    if (!user) user = interaction.user;
    let newProfileData;
    try {
      newProfileData = await profileModel.findOne({
        userID: user.id,
      });
      if (!newProfileData) {
        newProfileData = await profileModel.create({
          userID: user.id,
          serverID: interaction.guild.id,
        });
      }
    } catch (error) {
      console.log(error);
    }

    const { balance } = newProfileData;
    const username = user.username;
    await interaction.reply(`${username} has ${balance} 🪙`);
  },
};
