import { nesConfig } from '../constant'
import { EmbedBuilder } from 'discord.js'
import { buildSlashCommand, getThemeColor } from '../utils'
import { SlashCommand } from 'types'

const nes: SlashCommand = {
  command: buildSlashCommand(nesConfig),
  execute: interaction => {
    if (interaction.isChatInputCommand()) {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({ name: 'NES!' })
            .setDescription(
              `🏓 UUUUUOOOOOOOHHHHHH!!!! SEGGGGGGGSSSSS!!!!\n 📡 By: ${interaction.user.username}`,
            )
            .setColor(getThemeColor('text')),
        ],
      })
    }
  },
  cooldown: 5,
}

export default nes
