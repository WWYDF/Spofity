// src/discord/slashCommands.ts
import { Client, Collection, Interaction } from 'discord.js';
import { pingCommand } from './commands/ping.js';

export const commands = new Collection<string, any>();

// Add your commands to the collection.
commands.set(pingCommand.data.name, pingCommand);

export function handleInteractions(client: Client) {
  client.on('interactionCreate', async (interaction: Interaction) => {
    // Only process chat input (slash) commands
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
      // Execute the command (and ensure you reply or defer)
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      // Attempt to reply if an error occurs.
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    }
  });
}
