const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fishing")
    .setDescription("Go fishing and catch some fish!"),
  async execute(interaction, profileData) {
    const { id } = interaction.user;

    // Define the possible catches and their rewards
    const catches = [
      { name: "Common Fish", reward: 1 },
      { name: "Uncommon Fish", reward: 20000 },
      { name: "Rare Fish", reward: 50000 },
      { name: "Epic Fish", reward: 1000000 },
      { name: "Legendary Fish", reward: 50000000 },
      { name: "Old Boot", reward: 50505050505050505 },
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
