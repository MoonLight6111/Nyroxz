// 🔹 BLOCK 1 – Command Metadata
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const os = require('os'); // optional, if you want later: CPU, RAM stats


module.exports = {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('📈 Shows how long the bot has been online without restart'),

  // 🔹 BLOCK 2 – Unified Execution Handler (w/ RAM, CPU, Version, Custom Hostname)
  async execute(input, args) {
    const totalSeconds = Math.floor(process.uptime());
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const seconds = totalSeconds % 60;
    const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    // 🧠 RAM Usage
    const memory = process.memoryUsage().heapUsed / 1024 / 1024;
    const ramUsage = `${memory.toFixed(2)} MB`;

    // ⚙️ CPU Info
    const cpus = os.cpus();
    const cpuModel = cpus[0].model;
    const cpuSpeed = cpus[0].speed + ' MHz';

    // 🤖 Bot Version Info
    const discordJsVersion = require('discord.js').version;
    const nodeVersion = process.version;

    // 🏷 Custom Hostname
    const hostname = 'MoonL8';

    let sent;
    if (input.isChatInputCommand?.()) {
      sent = await input.deferReply({ fetchReply: true });
    } else {
      sent = await input.channel.send('🟢 Fetching uptime info...');
    }

    // 🔹 BLOCK 3 – Embed Construction (Green Fire + System Specs + Custom Hostname)
    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('🟢 Bot Uptime Status')
      .setThumbnail(input.client.user.displayAvatarURL({ dynamic: true }))
      .setDescription('> 🧭 **System performance stats**\n> Tracking uptime, memory, and environment.')
      .addFields(
        { name: '⏳ Uptime', value: `\`${uptimeString}\``, inline: true },
        { name: '📅 Started On', value: `<t:${Math.floor(Date.now() / 1000 - process.uptime())}:F>`, inline: true },
        { name: '🧠 RAM Usage', value: `\`${ramUsage}\``, inline: true },
        { name: '🖥 CPU Model', value: `\`${cpuModel}\``, inline: false },
        { name: '⚡ CPU Speed', value: `\`${cpuSpeed}\``, inline: true },
        { name: '🔧 Node.js Version', value: `\`${nodeVersion}\``, inline: true },
        { name: '📦 Discord.js Version', value: `\`v${discordJsVersion}\``, inline: true },
        { name: '🏷 Hostname', value: `\`${hostname}\``, inline: true }
      )
      .setFooter({
        text: `Requested by ${input.user?.tag || input.author.tag}`,
        iconURL: input.user?.displayAvatarURL?.() || input.author.displayAvatarURL(),
      })
      .setTimestamp();

  },
};

