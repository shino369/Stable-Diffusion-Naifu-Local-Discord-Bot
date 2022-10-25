import { Client } from 'discord.js'
import { readdirSync } from 'fs'
import { BotEvent } from '../types'

const Events = (client: Client) => {
  const CHILDNAME = '/events'
  const handlersDir = process.env[`${process.env.NODE_ENV==='build' ? 'BUILD_' : ''}ROOTNAME`] + CHILDNAME
  readdirSync(handlersDir).forEach(async file => {
    if (!file.endsWith(process.env[`${process.env.NODE_ENV==='build' ? 'BUILD_' : ''}EXT`])) {
      return
    }
    let event: BotEvent = (await import(`..${CHILDNAME}/${file}`)).default
    event.once
      ? client.once(event.name, (...args) => event.execute(...args))
      : client.on(event.name, (...args) => event.execute(...args))
    console.log(`Successfully loaded event ${event.name}`)
  })
}

export default Events
