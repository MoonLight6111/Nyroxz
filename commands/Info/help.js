// 🔹 BLOCK 1 – Command Metadata & Required Modules
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'help',
  description: 'List all commands and categories',
  data: {
    name: 'help',
    description: 'List all commands and categories',
  },

// 🔹  BLOCK 2 – Execution Logic (Embed Generator + Responder)
  async execute(interactionOrMessage, isSlash = false) {
    const commandsFolder = path.join(__dirname, '../');
  const user = isSlash
  ? interactionOrMessage.user || interactionOrMessage.member?.user
  : interactionOrMessage.author || interactionOrMessage.member?.user;

    const guild = interactionOrMessage.guild;
    const serverIcon = guild?.iconURL({ dynamic: true });
    const serverName = guild?.name || 'Unknown Server';

    const commandsByCategory = {};

    const categories = fs.readdirSync(commandsFolder);
    for (const category of categories) {
      const categoryPath = path.join(commandsFolder, category);
      if (!fs.statSync(categoryPath).isDirectory()) continue;

      const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
      const commands = [];

      for (const file of commandFiles) {
        const command = require(path.join(categoryPath, file));
        commands.push({
          name: command.name || 'Unnamed',
          description: command.description || 'No description provided.',
        });
      }

      commandsByCategory[category] = commands;
    }

    // 🔹  BLOCK 3 – Embed Construction + Final Response
        const embed = new EmbedBuilder()
      .setTitle('💡 Nyroxz Command Center')
      .setDescription("Here’s everything I can do for you:\n\n🔹 Use `.command` or `/command` — your choice.\n🧠 Commands are sorted by category for easy navigation.")
      .setColor(0x00FF00)
      .setThumbnail(serverIcon || null)
      .setTimestamp()
     .setFooter({
  text: `Requested by ${user?.tag || user?.username || 'Unknown User'}`,
  iconURL: user?.displayAvatarURL?.() || null,
});


    for (const [category, commands] of Object.entries(commandsByCategory)) {
      if (commands.length === 0) continue;

      const value = commands
        .map(cmd => `• **${cmd.name}** — ${cmd.description}`)
        .join('\n');

      embed.addFields({ name: `📂 ${category}`, value });
    }

    // Send the embed response
    if (isSlash) {
      await interactionOrMessage.reply({ embeds: [embed] });
    } else {
      await interactionOrMessage.reply({ embeds: [embed] });
    }
  }
};
