const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
const profileModel = require("../models/profileSchema");
const parseMilliseconds = require("parse-ms-2");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fishing")
    .setDescription("Go fishing and catch some fish!"),
  async execute(interaction, profileData) {
    const { id } = interaction.user;

    const cooldown = 86400000;
    const timeLeft = cooldown - (Date.now() - dailyLastUsed);

    if (timeLeft > 0) {
            await interaction.deferReply({ ephemeral: true });
            const { hours, minutes, seconds } = parseMilliseconds(timeLeft);
            await interaction.editReply(`You can fish in ${hours} hrs ${minutes} min ${seconds} sec`);
            return;
        }

        await interaction.deferReply();

        const randomAmt = Math.floor(Math.random() * (dailyMax - dailyMin + 1) + dailyMin);

    // Define the possible catches and their rewards
    const catches = [
      { name: "Common Fish", reward: 10 },
      { name: "Uncommon Fish", reward: 50 },
      { name: "Rare Fish", reward: 150 },
      { name: "Epic Fish", reward: 1000 },
      { name: "Legendary Fish", reward: 100000 },
      { name: "Old Boot", reward: 10000000000 },
    ];

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("fish")
        .setLabel("Cast your line")
        .setStyle(1)
    );

    await interaction.reply({
      content: "Click the button to cast your line and go fishing!",
      components: [row],
      fetchReply: true,
    });

    const filter = (i) =>
      i.customId === "fish" && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 15000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "fish") {
        const catchResult = catches[Math.floor(Math.random() * catches.length)];

        if (catchResult.reward > 0) {
          await profileModel.findOneAndUpdate(
            { userID: id },
            { $inc: { balance: catchResult.reward } }
          );
        }

        const disabledRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("fish")
            .setLabel("Cast your line")
            .setStyle(1)
            .setDisabled(true)
        );

        await i.update({
          content: `You caught a ${catchResult.name}! You earned ${catchResult.reward} coins.`,
          components: [disabledRow],
        });
        collector.stop();
      }
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        interaction.editReply({
          content: "Time's up! You didn't cast your line.",
          components: [],
        });
      }
    });
  },
};
