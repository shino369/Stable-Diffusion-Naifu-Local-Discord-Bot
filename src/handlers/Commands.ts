import { Client, Routes, SlashCommandBuilder } from 'discord.js'
import { REST } from '@discordjs/rest'
import fs from 'fs'
import { SlashCommand } from '../types'
import { color } from '../utils'
// import { commands } from '../constant'

const deploy = (slashCommands: SlashCommandBuilder[]) => {
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
  const handlersDir =
    process.env[`${process.env.NODE_ENV === 'build' ? 'BUILD_' : ''}ROOTNAME`] +
    CHILDNAME
  // let commandsDir = join(__dirname, '../commands')
  const promiseArr: any = []
  fs.readdirSync(handlersDir).forEach(file => {
    if (
      !file.endsWith(
        process.env[`${process.env.NODE_ENV === 'build' ? 'BUILD_' : ''}EXT`],
      )
    ) {
      return
    }

    // exclude files
    const exclude:string[] = []
    if (exclude.length > 0 && exclude.find(f => file.includes(f))) {
      return
    }
    promiseArr.push(import(`..${CHILDNAME}/${file}`))

    if (promiseArr.length > 0) {
      Promise.all(promiseArr).then(res => {
        res.forEach(module => {
          let command: SlashCommand = module.default
          slashCommands.push(command.command.toJSON())
          client.slashCommands.set(command.command.name, command)
        })

        deploy(slashCommands)
      })
    }
  })
}

export default Commands
