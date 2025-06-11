// 🔹 BLOCK 1 – Command Metadata & Permission Config
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('🔊 Send a message as the bot')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message to say')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // Slash-only perms

  name: 'say',
  description: '🔊 Send a message as the bot',

  // Execution continues in Block 2 below
};

// 🔹 BLOCK 2 – Unified Execution Handler (Slash & Prefix)
module.exports.execute = async (input, args) => {
  const isSlash = input.isChatInputCommand?.();
  const member = input.member || input.guild?.members.cache.get(input.author?.id);

  // 🔐 Permission Check
  if (!member?.permissions?.has(PermissionsBitField.Flags.ManageMessages)) {
    const denyEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('🚫 Access Denied')
      .setDescription('You do not have permission to use this command.')
      .setTimestamp();

    if (isSlash) {
      return input.reply({ embeds: [denyEmbed], ephemeral: true });
    } else {
      return input.channel.send({ embeds: [denyEmbed] });
    }
  }

  // 🔡 Message Content Extraction
  const messageContent = isSlash
    ? input.options.getString('message')
    : args.join(' ');

  if (!messageContent) {
    const errorEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setDescription('❌ Please provide a message to send.');

    if (isSlash) {
      return input.reply({ embeds: [errorEmbed], ephemeral: true });
    } else {
      return input.channel.send({ embeds: [errorEmbed] });
    }
  }

  // Proceed to embed construction


  // 🔹 BLOCK 3 – Embed Construction and Final Send
  const embed = new EmbedBuilder()
    .setColor(0x00FF00)
    .setDescription(messageContent)
    

  if (isSlash) {
    await input.reply({
  content: '✅ Message sent!',
  flags: 1 << 6 // Equivalent to MessageFlags.Ephemeral
});

    await input.channel.send({ embeds: [embed] });
  } else {
    await input.channel.send({ embeds: [embed] });
  }
};
