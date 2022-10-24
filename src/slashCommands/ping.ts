import { pingConfig } from '../constant'
import { EmbedBuilder } from 'discord.js'
import { buildSlashCommand, getThemeColor } from '../utils'
import { SlashCommand } from '../types'

const ping: SlashCommand = {
  command: buildSlashCommand(pingConfig),
  execute: interaction => {
    if (interaction.isChatInputCommand()) {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({ name: 'Ping Info' })
            .setDescription(
              `🏓 Pong! \n 📡 Ping: ${interaction.client.ws.ping}`,
            )
            .setColor(getThemeColor('text')),
        ],
      })
    }
  },
  cooldown: 5,
}

export default ping
