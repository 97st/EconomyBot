const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("wheeloffortune")
    .setDescription("Spin the wheel of fortune and win coins!"),
  async execute(interaction, profileData) {
    await interaction.deferReply();
    const { id } = interaction.user;
    const { spinLastUsed } = profileData;
    const cooldown = 86400000;
    const timeLeft = cooldown - (Date.now() - spinLastUsed);

    if (timeLeft > 0) {
      await interaction.editReply(
        `You can spin the wheel again in <t:${Math.floor(
          (spinLastUsed + cooldown) / 1000
        )}:R>`
      );
      return;
    }

    // Define the possible rewards
    const rewards = [
      100, 200, 300, 400, 500, 1000, 2000, 5000, 10000, 5000000000000,
    ];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("spin")
        .setLabel("Spin the Wheel")
        .setStyle(1)
    );

    await interaction.editReply({
      content: "Click the button to spin the wheel!",
      components: [row],
      fetchReply: true,
    });

    const filter = (i) =>
      i.customId === "spin" && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 15000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "spin") {
        await profileModel.findOneAndUpdate(
          { userID: id },
          { $set: { spinLastUsed: Date.now() }, $inc: { balance: reward } }
        );

        const disabledRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("spin")
            .setLabel("Spin the Wheel")
            .setStyle(1)
            .setDisabled(true)
        );

        await i.update({
          content: `You won ${reward} coins!`,
          components: [disabledRow],
        });
        collector.stop();
      }
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        interaction.editReply({
          content: "Time's up! You didn't spin the wheel.",
          components: [],
        });
      }
    });
  },
};
