// src/index.ts
import { Client, GatewayIntentBits, Message, TextChannel } from 'discord.js';
import { config } from '../system/config.js';
import sendLog from '../system/logger.js';
import { handleInteractions } from './cmdHandler.js';
import { playUrl } from './wrappers/play.js';

export async function startBot() {
  const TOKEN = config.bot_token;
  const PREFIX = config.text_prefix;

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.once('ready', () => {
    sendLog('success', `Logged in as ${client.user?.tag}!`);
  });

  handleInteractions(client);

  client.on('messageCreate', async (message: Message) => {
    // Ignore bot messages and messages that don't start with the prefix.
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
    const command = args.shift()?.toLowerCase();
    const textChannel = message.channel as TextChannel


    if (command === 'play') {
      const url = args[0];
      // doesnt do anything rn
    }
  });

  client.login(TOKEN);
  return client;
}
