const { SlashCommandBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("donate")
        .setDescription("donate coins to a friend")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("the user you want to donate to")
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName("amount")
                .setDescription("the amount of coins you want to donate")
                .setRequired(true)
                .setMinValue(1)
        ),
    async execute(interaction, profileData) {
        const receiveUser = interaction.options.getUser("user");
        const donateAmt = interaction.options.getInteger("amount");

        const { balance } = profileData;

        if (balance < donateAmt) {
            await interaction.deferReply({ ephemeral: true });
            return await interaction.editReply(`you do not have ${donateAmt} coins in your balance`

            );
        }



        const receiveUserData = await profileModel.findOneAndUpdate(
            {
                userID: receiveUser.id,
            },
            {
                $inc: {
                    balance: donateAmt,
                },
            }
        );

        if (!receiveUserData) {
            await interaction.deferReply({ ephemeral: true })
            return await interaction.editReply(`${receiveUser.username} is not in the currency system`)
        }


        await interaction.deferReply();


        await profileModel.findOneAndUpdate(
            {
                userID: interaction.user.id,
            },
            {
                $inc: {
                    balance: -donateAmt,
                },
            }
        );

        interaction.editReply(`you have donated ${donateAmt} coins to ${receiveUser.username}`

        )

    },
};
