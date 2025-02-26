// src/discord/wrapper.ts - Centralizes command handling
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import { ChatInputCommandInteraction, TextBasedChannel, } from "discord.js";
import { getYtDlpStream } from "../../ytdlp.js";
import sendLog from "../../system/logger.js";
  
/**
 * playUrlSlash
 * ------------
 * Plays a YouTube URL in a voice channel using a slash command interaction.
 *
 * @param url - The YouTube video URL.
 * @param interaction - The ChatInputCommandInteraction from the slash command.
 */
export async function playUrl(
    url: string,
    interaction: ChatInputCommandInteraction
  ) {
    // Check that the interaction has a valid channel.
    const textChannel = interaction.channel as TextBasedChannel;
    if (!textChannel) {
      return interaction.reply({
        content: "Could not determine the text channel.",
        ephemeral: true,
      });
    }
  
    // Ensure the member is in a voice channel.
    const member = interaction.member;
    // For slash commands, member may be a GuildMember (if in a guild)
    if (!member || !("voice" in member) || !member.voice.channel) {
      return interaction.reply({
        content: "You need to be in a voice channel to play music!",
        ephemeral: true,
      });
    }
  
    try {
      // Defer the reply so we have time to join the channel and start playing.
      await interaction.deferReply();
  
      // Join the voice channel.
      const voiceChannel = member.voice.channel;
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });
  
      // Wait for the connection to be ready.
      await entersState(connection, VoiceConnectionStatus.Ready, 30000);
  
      // Get the audio stream from our yt-dlp wrapper.
      const stream = getYtDlpStream(url);
  
      // Create an audio resource from the stream.
      const resource = createAudioResource(stream);
  
      // Create an audio player and start playing.
      const player = createAudioPlayer();
      player.play(resource);
      connection.subscribe(player);
  
      player.on(AudioPlayerStatus.Playing, () => {
        // Once the player starts, let the user know.
        interaction.followUp(`Now playing: ${url}`);
      });
  
      player.on(AudioPlayerStatus.Idle, () => {
        // When the track ends, clean up the connection.
        if (connection.state.status !== VoiceConnectionStatus.Destroyed) {
          connection.destroy();
        }
      });
  
      player.on("error", (error) => {
        sendLog("error", `Audio player error: ${error}`);
        interaction.followUp("There was an error playing the track.");
        if (connection.state.status !== VoiceConnectionStatus.Destroyed) {
          connection.destroy();
        }
      });
    } catch (error) {
      sendLog("error", `Error while trying to play track: ${error}`);
      interaction.reply({
        content: "Error playing track. Please try again later.",
        ephemeral: true,
      });
    }
  }
  