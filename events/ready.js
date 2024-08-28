const { Events, ActivityType } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`ready! logged in as ${client.user.tag}`);
    await client.user.setActivity("everybody get insane gambling debts", {
      type: ActivityType.Watching,
    });
  },
};
