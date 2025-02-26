// src/index.ts
import { Client, GatewayIntentBits, Message, TextChannel } from 'discord.js';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } from '@discordjs/voice';
import { getYtDlpStream } from '../ytdlp.js';
import { config } from '../system/config.js';
import sendLog from '../system/logger.js';
import { handleInteractions } from './cmdHandler.js';

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
      if (!url) {
        return textChannel.send('Please provide a YouTube URL.');
      }

      // Ensure the member is in a voice channel.
      const voiceChannel = message.member?.voice.channel;
      if (!voiceChannel) {
        return textChannel.send('You need to be in a voice channel to play music!');
      }

      try {
        // Join the voice channel.
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: voiceChannel.guild.id,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        // Wait for the connection to be ready.
        await entersState(connection, VoiceConnectionStatus.Ready, 30000);

        // Use our custom wrapper to get the audio stream from yt-dlp.
        const stream = getYtDlpStream(url);

        // Create an audio resource from the stream.
        const resource = createAudioResource(stream);

        // Create an audio player.
        const player = createAudioPlayer();
        player.play(resource);
        connection.subscribe(player);

        player.on(AudioPlayerStatus.Playing, () => {
          textChannel.send(`Now playing: ${url}`);
        });

        player.on(AudioPlayerStatus.Idle, () => {
          // Cleanly destroy the connection when the track ends.
          if (connection.state.status !== VoiceConnectionStatus.Destroyed) {
            connection.destroy();
          }
        });

        player.on('error', (error) => {
          console.error('Audio player error:', error);
          textChannel.send('There was an error playing the track.');
          if (connection.state.status !== VoiceConnectionStatus.Destroyed) {
            connection.destroy();
          }
        });
      } catch (error) {
        console.error('Error while trying to play track:', error);
        textChannel.send('Error playing track. Please try again later.');
      }
    }
  });

  client.login(TOKEN);
  return client;
}
