// 🔹 BLOCK 1 – Command Metadata
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: '🔥 Check full latency diagnostics of the bot',

  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('🔥 Check full latency diagnostics of the bot'),

  // 🔹 BLOCK 2 – Unified Execution Handler (Slash & Prefix)
  async execute(input, args) {
    const now = Date.now();
    let sent;

    // Handle Slash Command
    if (input.isChatInputCommand?.()) {
      sent = await input.reply({ content: '⚡ Measuring power levels...', fetchReply: true });
    }

    // Handle Prefix Command
    else if (input.content) {
      sent = await input.channel.send('⚡ Measuring power levels...');
    }

    // 🔹 BLOCK 3 – Latency Metrics Calculation
    const replyTimestamp = sent.createdTimestamp || Date.now();
    const requestTimestamp = input.createdTimestamp || now;

    const clientLatency = replyTimestamp - requestTimestamp;
    const apiLatency = Math.round(input.client.ws.ping);
    const botLatency = Date.now() - now;
    const avgResponseTime = Math.round((clientLatency + apiLatency + botLatency) / 3);

    // 🔹 BLOCK 4 – Embed Construction (Green Theme)
    const embed = new EmbedBuilder()
      .setColor(0x00FF00) // ✅ Green Theme
      .setTitle('🚀 System Diagnostics: Latency Test')
      .setThumbnail(input.client.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        {
          name: '🧠 Client Latency',
          value: `\`${clientLatency}ms\``,
          inline: true,
        },
        {
          name: '🛠 Bot Latency',
          value: `\`${botLatency}ms\``,
          inline: true,
        },
        {
          name: '🌐 API Latency',
          value: `\`${apiLatency}ms\``,
          inline: true,
        },
        {
          name: '📊 Average Response',
          value: `\`${avgResponseTime}ms\``,
          inline: false,
        }
      )
      .setDescription('> ⚙️ **Latency breakdown to help you monitor performance.**')
      .setFooter({
        text: `Requested by ${input.user?.tag || input.author?.tag || 'Unknown User'}`,
        iconURL: input.user?.displayAvatarURL?.() || input.author?.displayAvatarURL?.() || null,
      })
      .setTimestamp();

    // 🔹 BLOCK 5 – Final Reply with the Embed
    if (input.isChatInputCommand?.()) {
      await input.editReply({ content: null, embeds: [embed] });
    } else {
      await sent.edit({ content: null, embeds: [embed] });
    }
  }
};
