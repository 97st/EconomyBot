const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  AttachmentBuilder,
} = require("discord.js");
const { createCanvas, GlobalFonts, loadImage } = require("@napi-rs/canvas");
const { request } = require("undici");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("balance")
    .setType(ApplicationCommandType.User),
  async execute(interaction, profileData) {
    await interaction.deferReply();
    const canvas = createCanvas(700, 250);
    const context = canvas.getContext("2d");

    context.fillStyle = "#2a2a2a";
    context.fillRect(0, 0, 700, 250);
    context.fillStyle = "#ffffff";

    context.font = "28px sans-serif";
    context.fillText("Profile", canvas.width / 2.5, canvas.height / 3.5);

    context.font = "60px sans-serif";
    context.fillText(
      interaction.targetMember.displayName,
      canvas.width / 2.5,
      canvas.height / 1.8
    );

    context.font = "60px Apple Color Emoji";
    context.fillStyle = "#ffd700";
    context.fillText("🪙", canvas.width / 2.5, canvas.height / 1.15);
    context.font = "40px sans-serif";
    context.fillText(
      `${profileData.balance}`,
      canvas.width / 2,
      canvas.height / 1.25
    );

    const { body } = await request(
      interaction.targetUser.displayAvatarURL({ extension: "jpg" })
    );
    const avatar = await loadImage(await body.arrayBuffer());

    context.beginPath();
    context.arc(125, 125, 100, 0, Math.PI * 2, true);
    context.closePath();
    context.clip();

    context.drawImage(avatar, 25, 25, 200, 200);

    const attachment = new AttachmentBuilder(
      await canvas.encode("png", { name: "test.png" })
    );
    await interaction.editReply({ files: [attachment] });
  },
};
