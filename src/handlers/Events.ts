import { Client } from 'discord.js'
import { readdirSync } from 'fs'
import { join } from 'path'
import { BotEvent } from 'types'

const Events = (client: Client) => {
  let eventsDir = join(__dirname, '../events')

  readdirSync(eventsDir).forEach(async file => {
    if (!file.endsWith('.js')) {
      console.log('not js!!!')
      return
    }
    let event: BotEvent = await import(`${eventsDir}/${file}`)
    event.once
      ? client.once(event.name, (...args) => event.execute(...args))
      : client.on(event.name, (...args) => event.execute(...args))
    console.log(`Successfully loaded event ${event.name}`)
  })
}

export default Events
