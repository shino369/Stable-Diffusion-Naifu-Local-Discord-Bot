import chalk from 'chalk'
import { config } from '../constant'
import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js'
import fetch from 'node-fetch'
import { Payload, SlashCommandType } from 'types'
import moment from 'moment'

type colorType = 'text' | 'variable' | 'error' | 'operation'

const themeColors = {
  text: '#ff8e4d',
  variable: '#ff624d',
  error: '#f5426c',
  operation: '#088F8F',
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

export const fetchImgToBase64 = async (url: string) => {
  let img = ''
  await fetch(url).then(async res => {
    await res.buffer().then(bff => {
      img = bff.toString('base64')
    })
  })
  return img
}

export const getImageResult = async (payload: Payload) => {
  const res = await fetch(process.env.BASE_URL + config.generateImageURL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await res.text()

  const str = data.toString()

  const splitArr = str.split('event: newImage')

  let fileArr: AttachmentBuilder[] = []
  // let embedArr: EmbedBuilder[] = []
  splitArr
    .map(arr => arr.trim())
    .forEach(img => {
      if (img.length > 0) {
        const index = img.indexOf('data:')
        const newStr = img.substring(index + 5)
        const imgBuff = Buffer.from(newStr, 'base64')
        const newDate = moment().format('YY-MM-DD-hh-mm-ss')
        const ran = Math.random() * 10
        const file = new AttachmentBuilder(imgBuff, {
          name: `${newDate + ran}.png`,
        })
        // const exampleEmbed = new EmbedBuilder()
        //   .setTitle(newDate)
        //   .setImage('attachment://discordjs.png')
        const newEmbed = new EmbedBuilder()
        // .setTitle(`${newDate + ran}.png`)
        // .setImage(`attachment://${newDate + ran}.png`) //.setURL(`https://localhost`);
        fileArr.push(file)
        // embedArr.push(newEmbed)
      }
    })

  return fileArr
}
