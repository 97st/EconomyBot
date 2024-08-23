const { SlashCommandBuilder } = require("discord.js");
const profileModel = require("../models/profileSchema");
const { customRoleCost } = require("../shopPrices.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("shop") // Changed to lowercase as commands should be lowercase
        .setDescription("A shop where you can spend your coins")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("custom-role")
                .setDescription(`Buy a custom role for ${customRoleCost}`)
                .addStringOption((option) =>
                    option
                        .setName("name")
                        .setDescription("Choose the name of your role")
                        .setMinLength(1)
                        .setMaxLength(25)
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("color")
                        .setDescription("Choose the color for your role")
                        .addChoices(
                            { name: "Red", value: "#FF0000" },
                            { name: "Cyan", value: "#00FFFF" },
                            { name: "Blue", value: "#0000FF" },
                            { name: "Yellow", value: "#FFFF00" },
                            { name: "Magenta", value: "#FF00FF" }
                        )
                        .setRequired(true)
                )
        ),

    async execute(interaction, profileData) {
        try {
            const { balance, userID } = profileData;
            const shopCommand = interaction.options.getSubcommand();

            if (shopCommand === "custom-role") {
                const name = interaction.options.getString("name");
                const color = interaction.options.getString("color");

                if (balance < customRoleCost) {
                    await interaction.deferReply({ ephemeral: true });
                    return await interaction.editReply(
                        `You need ${customRoleCost} coins to buy a custom role.`
                    );
                }

                await interaction.deferReply();

                const customRole = await interaction.guild.roles.create({
                    name,
                    permissions: [], // Changed to lowercase 'permissions'
                    color,
                });

                await interaction.member.roles.add(customRole);

                await profileModel.findOneAndUpdate(
                    { userID },
                    { $inc: { balance: -customRoleCost } } // Correctly deducting the balance
                );

                await interaction.editReply("Successfully purchased a custom role.");
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply("An error occurred while processing your request.");
        }
    }
};
