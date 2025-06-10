// 🔹 BLOCK 1 – Command Metadata
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const os = require('os'); // optional, if you want later: CPU, RAM stats


module.exports = {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('📈 Shows how long the bot has been online without restart'),

   // 🔹 BLOCK 2 – With Placeholder Message (Works Smoothly)
  async execute(input, args) {
    const totalSeconds = Math.floor(process.uptime());
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const seconds = totalSeconds % 60;
    const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const discordJsVersion = require('discord.js').version;
    const nodeVersion = process.version;
    const hostname = 'MoonL8';

    let sent;

    // Slash vs Prefix handling (safe & correct)
    if (input.isChatInputCommand?.()) {
      sent = await input.reply({ content: '🔄 Fetching info...', fetchReply: true });
    } else {
      sent = await input.channel.send('🔄 Fetching info...');
    }

    // 🔹 BLOCK 3 – Send Embed After Placeholder
    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('🟢 Bot Uptime Report')
      .setThumbnail(input.client.user.displayAvatarURL({ dynamic: true }))
      .setDescription('> **System online and running smooth!**\n> All systems operational ⚡')
      .addFields(
        { name: '⏳ Uptime', value: `🟢 \`${uptimeString}\``, inline: true },
        { name: '📅 Online Since', value: `🕒 <t:${Math.floor(Date.now() / 1000 - process.uptime())}:F>`, inline: true },
        { name: '🏷 Hostname', value: `🌐 \`${hostname}\``, inline: true },
        { name: '⚙️ Node.js', value: `\`${nodeVersion}\``, inline: true },
        { name: '📦 Discord.js', value: `\`v${discordJsVersion}\``, inline: true }
      )
      .setFooter({
        text: `Status requested by ${input.user?.tag || input.author.tag}`,
        iconURL: input.user?.displayAvatarURL?.() || input.author.displayAvatarURL()
      })
      .setTimestamp();

    // ✅ Replace the "Fetching..." message with embed
    await sent.edit({ content: null, embeds: [embed] });

  },
};

