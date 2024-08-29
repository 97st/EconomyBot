const { Events } = require("discord.js");
const profileModel = require("../models/profileSchema");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      // get user db information and pass to command
      let profileData;
      try {
        profileData = await profileModel.findOne({
          userID: interaction.user.id,
        });
        if (!profileData) {
          profileData = await profileModel.create({
            userID: interaction.user.id,
            serverID: interaction.guild.id,
          });
        }
      } catch (error) {
        console.log(error);
      }

      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        );
        return;
      }

      try {
        await command.execute(interaction, profileData);
      } catch (error) {
        console.error(`Error executing ${interaction.commandName}`);
        console.error(error);
      }
    } else if (interaction.isUserContextMenuCommand()) {
      // get user db information and pass to command
      let profileData;
      try {
        profileData = await profileModel.findOne({
          userID: interaction.targetUser.id,
        });
        if (!profileData) {
          profileData = await profileModel.create({
            userID: interaction.targetuser.id,
            serverID: interaction.guild.id,
          });
        }
      } catch (error) {
        console.log(error);
      }

      const command = require(`../contextmenu/${interaction.commandName}.js`);

      if (!command) {
        console.error(
          `No contextmenu command matching ${interaction.commandName} was found.`
        );
        return;
      }

      try {
        await command.execute(interaction, profileData);
      } catch (error) {
        console.error(`Error executing contextmenu ${interaction.commandName}`);
        console.error(error);
      }
    }
  },
};
