const { SlashCommandBuilder, Embed } = require("discord.js");
const { EmbedBuilder } = require("@discordjs/builders");
const profileModel = require("../models/profileSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("shows the top 10 coin earners"),
  async execute(interaction, profileData) {
    await interaction.deferReply();

    const { username, id } = interaction.user;
    const { balance } = profileData;

    let leaderboardEmbed = new EmbedBuilder()
      .setTitle("**Top 10 Coin Earners**")
      .setColor(0x45d6fd)
      .setFooter({ text: "you are not ranked yet" });

    const members = await profileModel
      .find()
      .sort({ balance: -1 })
      .catch((err) => console.log(err));

    const memberIdx = members.findIndex((member) => member.userID === id);

    leaderboardEmbed.setFooter({
      text: `${username}, you're rank #${memberIdx + 1} with ${balance}`,
    });

    const topTen = members.slice(0, 10);
    let desc = "";
    for (let i = 0; i < topTen.length; i++) {
      let { user } = await interaction.guild.members.fetch(topTen[i].userID);
      if (!user) return;
      let userBalance = topTen[i].balance;
      desc += `**${i + 1}. <@${user.id}>:** ${userBalance} 🪙\n`;
    }
    if (desc !== "") {
      leaderboardEmbed.setDescription(desc);
    }

    await interaction.editReply({ embeds: [leaderboardEmbed] });
  },
};
