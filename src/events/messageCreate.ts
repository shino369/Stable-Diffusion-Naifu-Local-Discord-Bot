import { Message } from 'discord.js'
import { BotEvent } from 'types'

const event: BotEvent = {
  name: 'messageCreate',
  execute: async (message: Message) => {
    if (!message.member || message.member.user.bot) return

    message.reply(
      `Hello ${message.author.username}! I'm a robot which generate illustration.`,
    )
  },
}

export default event
