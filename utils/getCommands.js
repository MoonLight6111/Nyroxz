// 📁 utils/getCommands.js – Safe Version with Error Handling
const fs = require('fs');
const path = require('path');

function getAllCommands(dirPath = path.join(__dirname, '..', 'commands')) {
  const categories = [];

  const categoriesFolders = fs.readdirSync(dirPath);

  for (const category of categoriesFolders) {
    const categoryPath = path.join(dirPath, category);
    const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

    const commands = [];

    for (const file of commandFiles) {
      const filePath = path.join(categoryPath, file);

      try {
        const command = require(filePath);

        const description =
          command.description ||
          command.data?.description ||
          'No description provided.';

        commands.push({
          name: command.name || command.data?.name || path.basename(file, '.js'),
          description
        });
      } catch (err) {
        console.warn(`❌ Failed to load ${filePath}: ${err.message}`);
        continue;
      }
    }

    categories.push({
      name: category,
      commands
    });
  }

  return categories;
}

module.exports = { getAllCommands };
