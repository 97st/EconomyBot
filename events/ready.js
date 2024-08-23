const { Events, ActivityType } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`ready! logged in as ${client.user.tag}`);
    client.user.setActivity("Join ", {
      type: ActivityType.Custom,
    });
  },
};
