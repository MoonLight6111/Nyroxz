//BLOCK 1 – Command Metadata & Permission Config
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nuke')
    .setDescription('🧹 Delete every message in this channel (without recreating it)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), // Admin/Mod Only
  name: 'nuke',
  description: '🧹 Delete every message in this channel (Admin/Mod only)',
};


//BLOCK 2 – Unified Execution Handler & Permission Check
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports.execute = async (input, args) => {
  const isSlash = !!input.isChatInputCommand?.();
  const member = input.member;

  // 🔐 Permission check
  if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
    const denyEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('🚫 Access Denied')
      .setDescription('You do not have permission to use this command.')
      .setTimestamp();

    return isSlash
      ? input.reply({ embeds: [denyEmbed], ephemeral: true })
      : input.reply({ embeds: [denyEmbed] });
  }

  // 🟡 Confirm only for prefix
  if (!isSlash) {
    await input.reply({
      content: '⚠️ Are you sure you want to delete **all messages** in this channel?\nReply with `yes` within 15 seconds to confirm.',
    });

    try {
      const filter = m =>
        m.author.id === input.author.id &&
        m.content.toLowerCase() === 'yes';

      await input.channel.awaitMessages({
        filter,
        max: 1,
        time: 15000,
        errors: ['time'],
      });
    } catch {
      await input.channel.send('❌ Time expired. Operation cancelled.');
      return;
    }
  }


  // BLOCK 3 – Count Total Messages First
  const channel = input.channel;
  let totalMessages = 0;
  let lastId = null;

  while (true) {
    const batch = await channel.messages.fetch({ limit: 100, before: lastId }).catch(() => null);
    if (!batch || batch.size === 0) break;
    totalMessages += batch.size;
    lastId = batch.last().id;
    await new Promise(res => setTimeout(res, 200)); // Light rate limit delay
  }

  if (totalMessages === 0) {
    return channel.send('✅ No messages to delete.');
  }


  //BLOCK 4 – Send & Protect Progress Bar
    const PROGRESS_BAR_SIZE = 20;

  function getProgressBar(current, total) {
    const filled = Math.round((current / total) * PROGRESS_BAR_SIZE);
    return '🟩'.repeat(filled) + '⬛'.repeat(PROGRESS_BAR_SIZE - filled);
  }

  const progressEmbed = new EmbedBuilder()
    .setColor(0x00FF00)
    .setTitle('🧹 Nuking in progress...')
    .setDescription(`${getProgressBar(0, totalMessages)}\n\`0 / ${totalMessages}\` messages deleted`)
    .setTimestamp();

  const progressMessage = await channel.send({ embeds: [progressEmbed] });
  const progressMessageId = progressMessage.id; // ⛔ Don't delete this message during loop


  // BLOCK 5 – Deletion Loop with Live Progress
    let deleted = 0;
  let beforeId = null;

  while (deleted < totalMessages) {
    const batch = await channel.messages.fetch({ limit: 100, before: beforeId }).catch(() => null);
    if (!batch || batch.size === 0) break;

    for (const msg of batch.values()) {
      if (msg.id === progressMessageId) continue; // ⛔ Skip deleting progress message

      await msg.delete().catch(() => {});
      deleted++;
      beforeId = msg.id;

      if (deleted === 1 || deleted % 10 === 0 || deleted === totalMessages) {
        progressEmbed.setDescription(`${getProgressBar(deleted, totalMessages)}\n\`${deleted} / ${totalMessages}\` messages deleted`);
        progressEmbed.setTimestamp(Date.now());
        await progressMessage.edit({ embeds: [progressEmbed] }).catch(() => {});
      }
    }

    await new Promise(res => setTimeout(res, 1000)); // Rate limit safe
  }


  // BLOCK 6 – Final Report & Auto Cleanup
    const finalEmbed = new EmbedBuilder()
    .setColor(0x00FF00)
    .setTitle('✅ Nuke Complete')
    .setDescription(`Deleted **${deleted}** messages.`)
    .setTimestamp();

  const summary = await channel.send({ embeds: [finalEmbed] });

  // ⌛ Clean up bot messages after 6 seconds
  setTimeout(async () => {
    await progressMessage.delete().catch(() => {});
    await summary.delete().catch(() => {});
  }, 6000);
};
