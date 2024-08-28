const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin")
    .setDescription("add or remove coins from someone")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("add coins to a user")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("the user you want to give the coins to")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("the amount of coins you want to give the user")
            .setRequired(true)
            .setMinValue(1)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("subtract")
        .setDescription("add coins to a user")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("the user you want to subtract the coins from")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("the amount of coins you want to subtract")
            .setRequired(true)
            .setMinValue(1)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set")
        .setDescription("set a user's coins")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("the user you want to set the coins for")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("amount")
            .setDescription("the amount of coins you want to set")
            .setRequired(true)
            .setMinValue(1)
        )
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const adminSubCommand = interaction.options.getSubcommand();

    if (adminSubCommand === "add") {
      const user = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("amount");

      await profileModel.findOneAndUpdate(
        {
          userID: user.id,
        },
        {
          $inc: {
            balance: amount,
          },
        }
      );

      await interaction.editReply(
        `Added ${amount} coins to ${user.username}'s balance`
      );
    } else if (adminSubCommand === "subtract") {
      const user = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("amount");

      await profileModel.findOneAndUpdate(
        {
          userID: user.id,
        },
        {
          $inc: {
            balance: -amount,
          },
        }
      );

      await interaction.editReply(
        `subtracted ${amount} coins to ${user.username}'s balance`
      );
    } else if (adminSubCommand === "set") {
      const user = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("amount");

      await profileModel.findOneAndUpdate(
        {
          userID: user.id,
        },
        {
          $set: {
            balance: amount,
          },
        }
      );

      await interaction.editReply(
        `set ${amount} coins for ${user.username}'s balance`
      );
    }
  },
};
