// src/register.ts - Registers Slash Commands with Discord REST API.
import { REST, Routes } from 'discord.js';
import { commands } from './components/discord/commands/index.js';
import { config } from './components/system/config.js';
import sendLog, { refreshLogs } from './components/system/logger.js';

async function main() {
  sendLog('info', 'Registering commands...');
  await refreshLogs();
  if (config.bot_token == "") { sendLog('critical', 'Bot Token is undefined. Please put it in config.json!'); return;}
  if (config.bot_clientId == "") { sendLog('critical', 'Bot Client ID is undefined. Please put it in config.json!'); return;}
  if (config.guildId == "") { sendLog('warn', 'Guild ID is undefined. Registering commands globally.');}

  await deployCommands();
}

main();



async function deployCommands() {
  const rest = new REST({ version: '10' }).setToken(config.bot_token);

  try {
    await rest.put(
      Routes.applicationGuildCommands(config.bot_clientId, config.guild_id),
      { body: commands.map(command => command.data.toJSON()) },
    );

    sendLog('success', 'Successfully registered application (/) commands.');
  } catch (error) {
    sendLog('error', `Failed to register commands! ${error}`);
  }
}


