import {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  // EmbedBuilder,
} from 'discord.js'
import fs from 'fs'
import dotenv from 'dotenv'
import { Command, SavedSetting, SlashCommand } from './types'

export const ROOTNAME = './src'

async function discordBotInit() {
  dotenv.config()

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel, Partials.Message],
  })

  client.slashCommands = new Collection<string, SlashCommand>()
  client.commands = new Collection<string, Command>()
  client.cooldowns = new Collection<string, number>()

  const CHILDNAME = '/handlers'
  const handlersDir = ROOTNAME + CHILDNAME
  fs.readdirSync(handlersDir).forEach(async handler => {
    // console.log(`${handlersDir}/${handler}`)
    const module =  await import(`.${CHILDNAME}/${handler}`)
    module.default(client)
  })

  client.login(process.env.TOKEN)
}

discordBotInit()
