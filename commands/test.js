const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("this is a test"),
  async execute(interaction, profileData) {
    await interaction.deferReply();
    interaction.editReply("doesnt do anything right now lol");
  },
};
