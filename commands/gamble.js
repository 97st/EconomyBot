const { SlashCommandBuilder, ButtonStyle } = require("discord.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("@discordjs/builders");
const profileModel = require("../models/profileSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("gamble")
        .setDescription("Gamble with your coins")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("three-doors")
                .setDescription("can double half or lose your gamble")
                .addIntegerOption((option) =>
                    option
                        .setName("amount")
                        .setDescription("amount of coins you want to gamble")
                        .setRequired(true)
                        .setMinValue(2)
                )
        ),
    async execute(interaction, profileData) {
        const { username, id } = interaction.user;
        const { balance } = profileData;

        const gambleCommand = interaction.options.getSubcommand();

        const gambleEmbed = new EmbedBuilder()
            .setColor(0xC0C0C0);

        if (gambleCommand === "three-doors") {
            const amount = interaction.options.getInteger("amount");

            if (balance < amount) {
                await interaction.deferReply({ ephemeral: true });
                return await interaction.editReply(`you dont have ${amount} coins to gamble with`);
            }

            await interaction.deferReply();

            const Button1 = new ButtonBuilder()
                .setCustomId("one")
                .setLabel("door one")
                .setStyle(ButtonStyle.Primary);

            const Button2 = new ButtonBuilder()
                .setCustomId("two")
                .setLabel("door two")
                .setStyle(ButtonStyle.Primary);

            const Button3 = new ButtonBuilder()
                .setCustomId("three")
                .setLabel("door three")
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder()
                .addComponents(Button1, Button2, Button3);

            gambleEmbed
                .setTitle(`playing three doors for ${amount} coins`)
                .setFooter({
                    text: "each door has double coins, lose half, or lose all",
                });

            await interaction.editReply({ embeds: [gambleEmbed], components: [row] });
            // Gather message we just sent
            const message = await interaction.fetchReply();

            const filter = (i) => i.user.id === interaction.user.id;

            // Use createMessageComponentCollector instead of createMessageCollector
            const collector = message.createMessageComponentCollector({
                filter,
                time: 60000,
            });

            const double = "double coins";
            const half = "lose half";
            const lose = "lose all";

            const getAmount = (label, gamble) => {
                let amount = -gamble;
                if (label === double) {
                    amount = gamble;
                } else if (label === half) {
                    amount = -Math.round(gamble / 2);
                }
                return amount;
            };

            let choice = null;

            collector.on("collect", async (i) => {
                let options = [Button1, Button2, Button3];
                const randIdxDouble = Math.floor(Math.random() * 3);
                const doubleButton = options.splice(randIdxDouble, 1)[0];
                doubleButton.setLabel(double).setDisabled(true);

                const randomIdxHalf = Math.floor(Math.random() * 2);
                const halfButton = options.splice(randomIdxHalf, 1)[0];
                halfButton.setLabel(half).setDisabled(true);

                const zeroButton = options[0];
                zeroButton.setLabel(lose).setDisabled(true);

                Button1.setStyle(ButtonStyle.Secondary);
                Button2.setStyle(ButtonStyle.Secondary);
                Button3.setStyle(ButtonStyle.Secondary);

                if (i.customId === "one") choice = Button1;
                else if (i.customId === "two") choice = Button2;
                else if (i.customId === "three") choice = Button3;

                choice.setStyle(ButtonStyle.Success);

                const label = choice.data.label;
                const amtChange = getAmount(label, amount);

                await profileModel.findOneAndUpdate(
                    {
                        userID: id,
                    },
                    {
                        $inc: {
                            balance: amtChange,
                        },
                    }
                );

                if (label === double) {
                    gambleEmbed
                        .setTitle("doubled! you just doubled your money")
                        .setFooter({ text: `${username} gained ${amtChange} coins` });
                } else if (label === half) {
                    gambleEmbed
                        .setTitle("you just lost half your coins gambled...")
                        .setFooter({ text: `${username} lost ${amtChange} coins` });
                } else if (label === lose) {
                    gambleEmbed
                        .setTitle("you just lost all your gamble...")
                        .setFooter({ text: `${username} lost ${amtChange} coins` });
                }

                await i.update({ embeds: [gambleEmbed], components: [row] });
                collector.stop();
            });
        }
    },
};