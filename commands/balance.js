const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("check your balance")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("the user you want to donate to")
        ),
    async execute(interaction, profileData) {
        const { balance } = profileData;
        const username = interaction.user.username;
        await interaction.reply(`${username} has ${balance} 🪙`)
    },
};