const {
  SlashCommandBuilder,
  ButtonBuilder,
  ActionRowBuilder,
} = require("discord.js");
const profileModel = require("../models/profileSchema");
const { blackjackReward } = require("../globalValues.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("blackjack")
    .setDescription("Play a game of blackjack!")
    .addIntegerOption((option) =>
      option
        .setName("bet")
        .setDescription("Amount of coins to bet")
        .setRequired(true)
    ),
  async execute(interaction, profileData) {
    const { id } = interaction.user;
    const bet = interaction.options.getInteger("bet");

    // Fetch the user's profile to check balance
    let userProfile = await profileModel.findOne({ userID: id });

    if (!userProfile || userProfile.balance < bet) {
      return await interaction.reply(
        `You don't have enough coins to place that bet!`
      );
    }

    const deck = createDeck();
    const playerHand = [drawCard(deck), drawCard(deck)];
    const dealerHand = [drawCard(deck), drawCard(deck)];

    let playerScore = calculateHand(playerHand);
    let dealerScore = calculateHand(dealerHand);

    let message = `Your hand: ${displayHand(
      playerHand
    )} (Total: ${playerScore})\nDealer's hand: ${displayHand([
      dealerHand[0],
    ])} and [Hidden]\n\n`;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("hit").setLabel("Hit").setStyle(1),
      new ButtonBuilder().setCustomId("stand").setLabel("Stand").setStyle(2)
    );

    await interaction.reply({
      content: message,
      components: [row],
      fetchReply: true,
    });

    const filter = (i) => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "hit") {
        playerHand.push(drawCard(deck));
        playerScore = calculateHand(playerHand);
        message = `Your hand: ${displayHand(
          playerHand
        )} (Total: ${playerScore})\nDealer's hand: ${displayHand([
          dealerHand[0],
        ])} and [Hidden]\n\n`;

        if (playerScore > 21) {
          message += `You busted! You lost ${bet} coins.`;
          await profileModel.findOneAndUpdate(
            { userID: id },
            { $inc: { balance: -bet } }
          );
          collector.stop();
        }

        await i.update({ content: message, components: [row] });
      } else if (i.customId === "stand") {
        while (dealerScore < 17) {
          dealerHand.push(drawCard(deck));
          dealerScore = calculateHand(dealerHand);
        }

        if (dealerScore > 21 || playerScore > dealerScore) {
          await profileModel.findOneAndUpdate(
            { userID: id },
            { $inc: { balance: bet * blackjackReward } }
          );
          message += `Dealer's hand: ${displayHand(
            dealerHand
          )} (Total: ${dealerScore})\n\nYou win! You earned ${
            bet * blackjackReward
          } coins.`;
        } else if (playerScore < dealerScore) {
          message += `Dealer's hand: ${displayHand(
            dealerHand
          )} (Total: ${dealerScore})\n\nYou lose! You lost ${bet} coins.`;
        } else {
          message += `Dealer's hand: ${displayHand(
            dealerHand
          )} (Total: ${dealerScore})\n\nIt's a tie! You get your bet back.`;
        }

        // Disable buttons after standing
        const disabledRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("hit")
            .setLabel("Hit")
            .setStyle(1)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId("stand")
            .setLabel("Stand")
            .setStyle(2)
            .setDisabled(true)
        );

        await i.update({ content: message, components: [disabledRow] });
        collector.stop();
      }
    });

    collector.on("end", async (collected) => {
      if (collected.size === 0) {
        message += `Time's up! You didn't make a choice. You lost ${bet} coins.`;
        await profileModel.findOneAndUpdate(
          { userID: id },
          { $inc: { balance: -bet } }
        );
        await interaction.editReply({ content: message, components: [] });
      }
    });
  },
};

function createDeck() {
  const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
  const values = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "Jack",
    "Queen",
    "King",
    "Ace",
  ];
  const deck = [];

  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }
  return shuffle(deck);
}

function drawCard(deck) {
  return deck.pop();
}

function calculateHand(hand) {
  let sum = 0;
  let aceCount = 0;

  for (const card of hand) {
    if (card.value === "Ace") {
      aceCount++;
      sum += 11;
    } else if (["King", "Queen", "Jack"].includes(card.value)) {
      sum += 10;
    } else {
      sum += parseInt(card.value);
    }
  }

  while (sum > 21 && aceCount > 0) {
    sum -= 10;
    aceCount--;
  }

  return sum;
}

function displayHand(hand) {
  return hand.map((card) => `${card.value} of ${card.suit}`).join(", ");
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
