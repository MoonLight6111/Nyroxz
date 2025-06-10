// 🔹 BLOCK 1 – Command Metadata
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Displays bot and API latency details in a fancy embed'),

  // 🔹 BLOCK 2 – Unified Execution Handler
  async execute(input, args) {
    const now = Date.now();
    let sent;

    // Slash command execution
    if (input.isChatInputCommand?.()) {
      sent = await input.reply({ content: '🏓 Calculating latency...', fetchReply: true });
    }

    // Prefix command execution
    else if (input.content) {
      sent = await input.channel.send('🏓 Calculating latency...');
    }

    // 🔹 BLOCK 3 – Latency Calculations
    const replyTimestamp = sent.createdTimestamp || Date.now();
    const requestTimestamp = input.createdTimestamp || now;

    const clientLatency = replyTimestamp - requestTimestamp;
    const apiLatency = Math.round(input.client.ws.ping);
    const botLatency = Date.now() - now;
    const avgResponseTime = Math.round((clientLatency + apiLatency + botLatency) / 3);

    // 🔹 BLOCK 4 – Embed Construction
    const embed = new EmbedBuilder()
      .setColor(0x00FF9D)
      .setTitle('🏓 Bot Latency Report')
      .addFields(
        { name: 'Client Latency', value: `\`${clientLatency}ms\``, inline: true },
        { name: 'Bot Latency', value: `\`${botLatency}ms\``, inline: true },
        { name: 'API Latency', value: `\`${apiLatency}ms\``, inline: true },
        { name: 'Avg Response Time', value: `\`${avgResponseTime}ms\``, inline: false },
      )
      .setFooter({ text: `Requested by ${input.user?.tag || input.author.tag}` })
      .setTimestamp();

    // 🔹 BLOCK 5 – Send Final Embed Response
    if (input.isChatInputCommand?.()) {
      await input.editReply({ content: null, embeds: [embed] });
    } else {
      await sent.edit({ content: null, embeds: [embed] });
    }
  },
};
