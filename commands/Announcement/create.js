const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('📢 Send an announcement to a selected channel')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The announcement message')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to send the announcement in') // Allows all channels
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  name: 'announce',
  description: '📢 Send an announcement to a selected channel',
};


// Block 2 – Announcement Execution Handler
const { ChannelType, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports.execute = async (interactionOrMessage, args = []) => {
  const isSlash = !!interactionOrMessage.isChatInputCommand;

  let messageContent;
  let targetChannel;

  if (isSlash) {
    messageContent = interactionOrMessage.options.getString('message');
    targetChannel = interactionOrMessage.options.getChannel('channel');
  } else {
    const mentionedChannel = interactionOrMessage.mentions.channels.first();
    targetChannel = mentionedChannel || interactionOrMessage.channel;

    // Remove channel mention from messageContent
    const raw = args.join(' ');
    messageContent = mentionedChannel
      ? raw.replace(/<#\d+>/g, '').trim()
      : raw.trim();
  }

  // 🛑 If no message, show usage
  if (!messageContent) {
    const usageEmbed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('❌ Invalid Usage')
      .setDescription('You must provide an announcement message.')
      .addFields(
        { name: '📘 Usage', value: '`.announce <message> [#channel]`' },
        { name: '🧪 Example', value: '`.announce Server will be down at 10PM #announcements`' }
      )
      .setFooter({
        text: `Requested by ${interactionOrMessage.user?.tag || interactionOrMessage.author.tag}`,
        iconURL: interactionOrMessage.user?.displayAvatarURL() || interactionOrMessage.author.displayAvatarURL()
      })
      .setTimestamp();

    return interactionOrMessage.reply({
      embeds: [usageEmbed],
      flags: isSlash ? (1 << 6) : undefined,
    });
  }

  // 🛑 Validate targetChannel
  if (!targetChannel || typeof targetChannel.send !== 'function') {
    return interactionOrMessage.reply({
      content: '❌ Please select a valid channel that supports messages.',
      flags: isSlash ? (1 << 6) : undefined,
    });
  }

  // 🛡️ Bot permission check
  const botMember = interactionOrMessage.guild.members.me;
  if (!targetChannel.permissionsFor(botMember)?.has(PermissionsBitField.Flags.SendMessages)) {
    return interactionOrMessage.reply({
      content: '❌ I cannot send messages in that channel.',
      flags: isSlash ? (1 << 6) : undefined,
    });
  }

  // 📢 Build announcement embed
  const announcementEmbed = new EmbedBuilder()
    .setColor(0x00FF00)
    .setTitle('📢・Announcement!')
    .setDescription(messageContent)
    .setTimestamp();

  await targetChannel.send({ embeds: [announcementEmbed] });

  // 🧾 Build log embed only if user mentioned another channel
  const shouldLog = !isSlash && interactionOrMessage.mentions.channels.first();
  const shouldDeleteCommand = !isSlash && !interactionOrMessage.mentions.channels.first();

  if (shouldLog) {
    const confirmationEmbed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('✅ Announcement Sent')
      .addFields({
        name: '📘 Channel',
        value: `${targetChannel} (${targetChannel.name})`,
      })
      .setFooter({
        text: `Requested by ${interactionOrMessage.user?.tag || interactionOrMessage.author.tag}`,
        iconURL: interactionOrMessage.user?.displayAvatarURL() || interactionOrMessage.author.displayAvatarURL(),
      })
      .setTimestamp();

    await interactionOrMessage.channel.send({ embeds: [confirmationEmbed] });
  }

  // 🧹 Delete command only if it was not a slash and not targeting another channel
  if (shouldDeleteCommand) {
    const canDelete = interactionOrMessage.channel
      .permissionsFor(botMember)
      ?.has(PermissionsBitField.Flags.ManageMessages);

    if (canDelete) {
      await interactionOrMessage.delete().catch(() => {});
    }
  }

  // ✅ Slash command confirmation
  if (isSlash) {
    const confirmationEmbed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('✅ Announcement Sent')
      .addFields({
        name: '📘 Channel',
        value: `${targetChannel} (${targetChannel.name})`,
      })
      .setFooter({
        text: `Requested by ${interactionOrMessage.user.tag}`,
        iconURL: interactionOrMessage.user.displayAvatarURL()
      })
      .setTimestamp();

    await interactionOrMessage.reply({
      embeds: [confirmationEmbed],
      flags: 1 << 6 // ephemeral
    });
  }
};
