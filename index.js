// block 1 
// index.js

// 1. Import discord.js library
const { Client, GatewayIntentBits } = require('discord.js');

// 2. Import and configure dotenv to load variables from .env file
require('dotenv').config();  // Looks for a `.env` file and loads variables like DISCORD_TOKEN

// 3. Create a new Discord client instance with required gateway intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,           // Needed to handle things like slash commands in servers
    GatewayIntentBits.GuildMessages,    // Needed to handle messageCreate events
    GatewayIntentBits.MessageContent,   // Needed to read the actual text content of messages
    GatewayIntentBits.GuildMembers,     // Needed to fetch or manage guild member info (e.g., for moderation)
  ],
});

// 🔹 Block 2 – Bot Login & Ready Event

// Log in the bot using the token from the .env file
client.login(process.env.DISCORD_TOKEN);

// Once the bot is ready and connected, this event triggers
client.once('ready', () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
});


// 🔹 Block 3 – Load Slash Commands Dynamically

const fs = require('fs');
const path = require('path');

// Create a collection (map-like structure) to hold all commands
client.commands = new Map();

// Define the path to the 'commands' directory
const commandsPath = path.join(__dirname, 'commands');

// Recursively read commands from folders and subfolders
function loadCommands(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      // Recursively load commands from subfolders (e.g., moderation/, music/, etc.)
      loadCommands(fullPath);
    } else if (file.name.endsWith('.js')) {
      const command = require(fullPath);
      
      // Ensure the command has both 'data' and 'execute' properties
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Loaded command: ${command.data.name}`);
      } else {
        console.warn(`⚠️  Skipped invalid command file: ${file.name}`);
      }
    }
  }
}

// Load all commands
loadCommands(commandsPath);

// 🔹 Block 4 – Register Slash Commands to Discord API (Guild-Based)

const { REST, Routes } = require('discord.js');

const commandsArray = [];

// Convert each loaded command's data to JSON for registration
client.commands.forEach(command => {
  commandsArray.push(command.data.toJSON());
});

// Create a REST instance for interacting with the Discord API
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// Register commands with the Discord server
(async () => {
  try {
    console.log('🔄 Registering slash commands...');

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commandsArray }
    );

    console.log('✅ Slash commands registered successfully (guild scope)');
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
  }
})();

// 🔹 Block 5 – Handle Slash Command Interactions

client.on('interactionCreate', async interaction => {
  // Only proceed if the interaction is a slash command
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  // If the command doesn't exist (somehow), safely exit
  if (!command) {
    console.warn(`⚠️  No command found for: ${interaction.commandName}`);
    return;
  }

  try {
    // Execute the command's logic
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Error executing ${interaction.commandName}:`, error);
    await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
  }
});

// 🔹 Block 6 – Handle Prefix Commands (e.g., .ping)

const prefix = '.';

client.on('messageCreate', async message => {
  // Ignore messages from bots or without the prefix
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  // Extract command name and args from message
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Check if this command exists in our command collection
  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    // Run the command — pass message and args for prefix usage
    if (typeof command.execute === 'function') {
      await command.execute(message, args);  // Allow dual compatibility inside command file
    }
  } catch (error) {
    console.error(`❌ Error executing ${commandName}:`, error);
    message.reply('There was an error trying to execute that command.');
  }
});

// 🔹 Block 7 – Bot Ready Event + Custom Status

client.once('ready', () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);

  client.user.setPresence({
    status: 'dnd', // online | idle | dnd | invisible
    activities: [
      {
        name: 'Nyrøxz Official',
        type: 2, // 0 = Playing, 1 = Streaming, 2 = Listening, 3 = Watching, 5 = Competing
      },
    ],
  });
});
