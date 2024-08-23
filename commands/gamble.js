const { SlashCommandBuilder, ButtonStyle } = require('discord.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const profileModel = require('../models/profileSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gamble')
        .setDescription('Gamble with your coins')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('three-doors')
                .setDescription('Can double, halve, or lose your gamble')
                .addIntegerOption((option) =>
                    option
                        .setName('amount')
                        .setDescription('Amount of coins you want to gamble')
                        .setRequired(true)
                        .setMinValue(2)
                )
        ),
    async execute(interaction, profileData) {
        const { username, id } = interaction.user;
        const { balance } = profileData;

        const gambleCommand = interaction.options.getSubcommand();

        const gambleEmbed = new EmbedBuilder().setColor(0xC0C0C0);

        if (gambleCommand === 'three-doors') {
            const amount = interaction.options.getInteger('amount');

            if (balance < amount) {
                await interaction.deferReply({ ephemeral: true });
                return await interaction.editReply(`You don't have ${amount} coins to gamble with.`);
            }

            await interaction.deferReply();

            const Button1 = new ButtonBuilder()
                .setCustomId('one')
                .setLabel('Door One')
                .setStyle(ButtonStyle.Primary);

            const Button2 = new ButtonBuilder()
                .setCustomId('two')
                .setLabel('Door Two')
                .setStyle(ButtonStyle.Primary);

            const Button3 = new ButtonBuilder()
                .setCustomId('three')
                .setLabel('Door Three')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder().addComponents(Button1, Button2, Button3);

            gambleEmbed
                .setTitle(`Playing three doors for ${amount} coins`)
                .setFooter({
                    text: 'Each door can double your coins, lose half, or lose all.',
                });

            await interaction.editReply({ embeds: [gambleEmbed], components: [row] });

            const message = await interaction.fetchReply();

            const filter = (i) => i.user.id === interaction.user.id;
            const collector = message.createMessageComponentCollector({
                filter,
                time: 60000,
            });

            const outcomes = [
                { label: 'Double Coins', value: amount },
                { label: 'Lose Half', value: -Math.round(amount / 2) },
                { label: 'Lose All', value: -amount },
            ];

            collector.on('collect', async (i) => {
                const selectedOutcome = outcomes.splice(Math.floor(Math.random() * outcomes.length), 1)[0];
                const remainingOutcomes = outcomes;
                remainingOutcomes.push(selectedOutcome);

                [Button1, Button2, Button3].forEach((button, idx) => {
                    button.setLabel(remainingOutcomes[idx].label).setDisabled(true);
                    if (button.customId === i.customId) {
                        button.setStyle(ButtonStyle.Success);
                    } else {
                        button.setStyle(ButtonStyle.Secondary);
                    }
                });

                const result = selectedOutcome.value;
                await profileModel.findOneAndUpdate(
                    { userID: id },
                    { $inc: { balance: result } }
                );

                gambleEmbed.setTitle(
                    result > 0
                        ? `Doubled! You just doubled your money!`
                        : result === 0
                            ? `You just lost half your coins...`
                            : `You just lost all your gamble...`
                ).setFooter({
                    text: `${username} ${result > 0 ? `gained` : `lost`} ${Math.abs(result)} coins`,
                });

                await i.update({ embeds: [gambleEmbed], components: [row] });
                collector.stop();
            });
        }
    },
};
