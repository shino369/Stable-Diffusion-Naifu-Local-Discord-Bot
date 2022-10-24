import { Client } from 'discord.js'
import { color } from '../utils'
import { BotEvent } from 'types'

const event: BotEvent = {
  name: 'ready',
  once: true,
  execute: (client: Client) => {
    if (client.user) {
      console.log(
        color('text', `Logged in as ${color('variable', client.user.tag)}`),
      )
    }
  },
}

export default event
