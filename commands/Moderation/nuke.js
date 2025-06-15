// 🔹 BLOCK 1 – Command Metadata & Permission Config
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nuke')
    .setDescription('🧹 Delete every message in this channel (without recreating the channel)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), // Admin/Mod Only
  name: 'nuke',
  description: '🧹 Delete every message in this channel (Admin/Mod only)',
};

// 🔹 BLOCK 2 – Unified Execution Handler & Permission Check
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports.execute = async (input, args) => {
  const isSlash = !!input.isChatInputCommand?.();
  const member = input.member;

  // 🔐 Permission Validation
  if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
    const denyEmbed = new EmbedBuilder()
      .setColor(0xFF0000) // Red for error
      .setTitle('🚫 Access Denied')
      .setDescription('You do not have permission to use this command.')
      .setTimestamp();

    return isSlash
      ? input.reply({ embeds: [denyEmbed], ephemeral: true })
      : input.reply({ embeds: [denyEmbed] });
  }

  // ✅ Proceed to message deletion next

    // Only apply confirmation for prefix usage to avoid complexity with slash commands
  if (!isSlash) {
    const confirmMessage = await input.reply({
      content: '⚠️ Are you sure you want to delete **all messages** in this channel?\nReply with `yes` within 15 seconds to confirm.',
    });

    try {
      const filter = m =>
        m.author.id === input.author.id &&
        m.content.toLowerCase() === 'yes';

      const collected = await input.channel.awaitMessages({
        filter,
        max: 1,
        time: 15000,
        errors: ['time'],
      });

      if (!collected.size) {
        await input.reply('❌ Confirmation not received. Operation cancelled.');
        return;
      }
    } catch (err) {
      await input.reply('❌ Time expired. Operation cancelled.');
      return;
    }
  }

 // 🔹 BLOCK 3 – Safe Deletion with Progress and Self-Cleanup
const channel = input.channel;
let totalDeleted = 0;
let lastMessageId = null;

// Send initial progress message
const progressMessage = await channel.send('🧹 Deleting messages... Please wait.');

while (true) {
  const messages = await channel.messages
    .fetch({ limit: 100, before: lastMessageId })
    .catch(() => null);

  if (!messages || messages.size === 0) break;

  for (const msg of messages.values()) {
    try {
      await msg.delete();
      totalDeleted++;
      lastMessageId = msg.id;
    } catch (_) {
      // Ignore undeletable messages silently
    }
  }

  // Prevent rate limits
  await new Promise(res => setTimeout(res, 750));
}

// ✅ Post final confirmation
const summaryEmbed = new EmbedBuilder()
  .setColor(0x00FF00)
  .setTitle('✅ Channel Cleared')
  .setDescription(`Successfully deleted **${totalDeleted}** messages.`)
  .setTimestamp();

const summaryMsg = await channel.send({ embeds: [summaryEmbed] });

// 🧹 Clean up messages safely after delay
setTimeout(async () => {
  try {
    // Double-check message existence before deleting
    const progMsg = await channel.messages.fetch(progressMessage.id).catch(() => null);
    if (progMsg) await progMsg.delete().catch(() => {});

    const sumMsg = await channel.messages.fetch(summaryMsg.id).catch(() => null);
    if (sumMsg) await sumMsg.delete().catch(() => {});
  } catch (err) {
    console.warn('Message cleanup encountered an error:', err.message);
  }
}, 5000)};
