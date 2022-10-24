import { Client, REST, Routes, SlashCommandBuilder } from 'discord.js'
import { readdirSync } from 'fs'
import { join } from 'path'
import { Command, SlashCommand } from 'types'
import { color } from 'utils/functions'

const Commands = (client: Client) => {
  const slashCommands: SlashCommandBuilder[] = []
  const commands: Command[] = []

  let slashCommandsDir = join(__dirname, '../slashCommands')
  let commandsDir = join(__dirname, '../commands')

  readdirSync(slashCommandsDir).forEach(async file => {
    if (!file.endsWith('.js')) {
      console.log('not js!!!')
      return
    }
    let command: SlashCommand = await import(`${slashCommandsDir}/${file}`)
    slashCommands.push(command.command)
    client.slashCommands.set(command.command.name, command)
  })

  readdirSync(commandsDir).forEach(async file => {
    if (!file.endsWith('.js')) {
      console.log('not js!!!')
      return
    }
    let command: Command = await import(`${commandsDir}/${file}`)
    commands.push(command)
    client.commands.set(command.name, command)
  })

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN)

  rest
    .put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: slashCommands.map(command => command.toJSON()),
    })
    .then((data: any) => {
      console.log(color("text", `🔥 Successfully loaded ${color("variable", data.length)} slash command(s)`))
      console.log(color("text", `🔥 Successfully loaded ${color("variable", commands.length)} command(s)`))
    })
    .catch(e => {
      console.log(e)
    })
}

export default Commands
