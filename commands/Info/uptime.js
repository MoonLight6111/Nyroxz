// 🔹 BLOCK 1 – Command Metadata
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const os = require('os'); // optional, if you want later: CPU, RAM stats

module.exports = {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('📈 Shows how long the bot has been online without restart'),


  // 🔹 BLOCK 2 – Unified Execution Handler (Slash + Prefix)
  async execute(input, args) {
    const totalSeconds = Math.floor(process.uptime());
    
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const seconds = totalSeconds % 60;

    const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    let sent;
    if (input.isChatInputCommand?.()) {
      sent = await input.deferReply({ fetchReply: true });
    } else {
      sent = await input.channel.send('🟢 Fetching uptime info...');
    }

        // 🔹 BLOCK 3 – Embed Construction (Green Theme, Fire Look)
    const embed = new EmbedBuilder()
      .setColor(0x00FF00) // ✅ Consistent Green Theme
      .setTitle('🟢 Bot Uptime Status')
      .setThumbnail(input.client.user.displayAvatarURL({ dynamic: true }))
      .setDescription('> 🧭 **Uptime since last reboot:**')
      .addFields(
        { name: '⏳ Uptime', value: `\`${uptimeString}\``, inline: true },
        { name: '🖥 Host', value: `\`${os.hostname()}\``, inline: true },
        { name: '📅 Started On', value: `<t:${Math.floor(Date.now() / 1000 - process.uptime())}:F>`, inline: false }
      )
      .setFooter({
        text: `Requested by ${input.user?.tag || input.author.tag}`,
        iconURL: input.user?.displayAvatarURL?.() || input.author.displayAvatarURL(),
      })
      .setTimestamp();
    // 🔹 BLOCK 4 – Final Response Delivery
    if (input.isChatInputCommand?.()) {
      await input.editReply({ embeds: [embed] });
    } else {
      await sent.edit({ content: null, embeds: [embed] });
    }
  },
};

