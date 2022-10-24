import { Client, Routes, SlashCommandBuilder } from 'discord.js'
import { REST } from '@discordjs/rest'
import fs from 'fs'
import { ROOTNAME } from '../index'
import { SlashCommand } from '../types'
import { color } from '../utils'
import { commands } from '../constant'

const deploy = (slashCommands:SlashCommandBuilder[]) => {
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN)
  rest
    .put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: slashCommands,
    })
    .then((res: any) => {
      // console.log(res)
      console.log(
        color(
          'text',
          `🔥 Successfully loaded ${color(
            'variable',
            res.length,
          )} slash command(s)`,
        ),
      )
    })
    .catch(e => {
      console.log(e)
    })
}

const Commands = (client: Client) => {
  const slashCommands: SlashCommandBuilder[] = []
  const CHILDNAME = '/slashCommands'
  const handlersDir = ROOTNAME + CHILDNAME

  // let commandsDir = join(__dirname, '../commands')

  fs.promises.readdir(handlersDir).then(async readdir => {
    readdir.forEach(async file => {
      if (!file.endsWith('.ts')) {
        return
      }
      let command: SlashCommand = (await import(`..${CHILDNAME}/${file}`))
        .default
      slashCommands.push(command.command.toJSON())
      client.slashCommands.set(command.command.name, command)
      if(slashCommands.length === readdir.length) {
        deploy(slashCommands)
      }
    })
  })

  // readdirSync(commandsDir).forEach(async file => {
  //   if (!file.endsWith('.ts')) {
  //     console.log('not ts!!!')
  //     return
  //   }
  //   let command: Command = await import(`${commandsDir}/${file}`)
  //   commands.push(command)
  //   client.commands.set(command.name, command)
  // })


}

export default Commands
