import chalk from 'chalk'
import { ApplicationCommandOptionType, SlashCommandBuilder } from 'discord.js'
import { SlashCommandType } from '../types'

type colorType = 'text' | 'variable' | 'error' | 'operation'

const themeColors = {
  text: '#ff8e4d',
  variable: '#ff624d',
  error: '#f5426c',
  operation: '#088F8F'
}

export const getThemeColor = (color: colorType) =>
  Number(`0x${themeColors[color].substring(1)}`)

export const color = (color: colorType, message: any) => {
  return chalk.hex(themeColors[color])(message)
}

export const buildSlashCommand = (slashCommandObj: SlashCommandType) => {
  const slashCommand = new SlashCommandBuilder()
    .setName(slashCommandObj.name)
    .setDescription(slashCommandObj.description)

  if (slashCommandObj.options && slashCommandObj.options.length > 0) {
    slashCommandObj.options.forEach((option: any) => {
      switch (option.type) {
        case ApplicationCommandOptionType.String: // string
          slashCommand.addStringOption(op => {
            op.setName(option.name).setDescription(option.description)
            if (option.max_length) {
              op.setMaxLength(option.max_length)
            }
            if (option.min_length) {
              op.setMinLength(option.min_length)
            }
            if (option.required) {
              op.setRequired(true)
            }
            if (option.choices && option.choices.length > 0) {
              op.addChoices(...option.choices)
            }

            return op
          })
          break
        case ApplicationCommandOptionType.Number: // number
          slashCommand.addNumberOption(op => {
            op.setName(option.name).setDescription(option.description)
            if (option.max_value) {
              op.setMaxValue(option.max_value)
            }
            if (option.min_value) {
              op.setMinValue(option.min_value)
            }
            if (option.required) {
              op.setRequired(true)
            }
            if (option.choices && option.choices.length > 0) {
              op.addChoices(...option.choices)
            }

            return op
          })
          break
        case ApplicationCommandOptionType.Attachment: // attachment
          slashCommand.addAttachmentOption(op =>
            op.setName(option.name).setDescription(option.description),
          )
          break
      }
    })
  }

  // console.log(slashCommand)
  return slashCommand
}
