// src/discord/commands/play.ts - Plays Music from YouTube URLs
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { playUrl } from '../wrappers/play.js';

export const playCommand = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a URL through YouTube.')
    .addStringOption(option =>
        option
          .setName('url')
          .setDescription('The URL of the specific video to play.')
          .setRequired(true)  // Makes this option required
      ),
  async execute(interaction: ChatInputCommandInteraction) {
    const url = interaction.options.getString("url", true);
    await playUrl(url, interaction);
  },
};
