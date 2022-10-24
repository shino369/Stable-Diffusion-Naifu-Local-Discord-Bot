import { AttachmentBuilder, EmbedBuilder } from 'discord.js'
import {
  buildSlashCommand,
  getThemeColor,
  getJsonFileFromPath,
  color,
} from '../utils'
import {
  Img2imgOptions,
  Options,
  Orientation,
  Payload,
  SavedSetting,
  Size,
  SlashCommand,
} from '../types'
import { config, promptConfig } from '../constant'
import moment from 'moment'
import fs from 'fs'
import fetch from 'node-fetch'
import _ from 'lodash'

const prompt: SlashCommand = {
  command: buildSlashCommand(promptConfig),
  execute: async interaction => {
    if (interaction.isChatInputCommand()) {
      console.log(color('operation', `Prompt received`))
      let newDate = moment().format('YY-MM-DD-hh-mm-ss')

      let options: Options = {
        positivePrompt: interaction.options.getString('positive')
          ? config.default.positive + interaction.options.getString('positive')
          : config.default.positive,
        negativePrompt:
          interaction.options.getString('negative') || config.default.negative,
        orientation:
          (interaction.options.getString('orientation') as Orientation) ||
          config.default.orientation,
        size:
          (interaction.options.getString('size') as Size) ||
          config.default.size,
        steps: interaction.options.getNumber('steps') || config.default.steps,
        scale: interaction.options.getNumber('scale') || config.default.scale,
      }

      const fileAttachment = interaction.options.getAttachment('img2img')
      const saveSetting = interaction.options.getNumber('save_setting')
      const getSetting = interaction.options.getNumber('get_setting')
      const sampleNumber = interaction.options.getNumber('number')
      const randomSeed = Math.floor(Math.random() * 2 ** 32 - 1)
      const seed = interaction.options.getNumber('seed')
      let img2imgOptions: Img2imgOptions = {}
      console.log(options)

      const savedSetting: SavedSetting = getJsonFileFromPath(
        './saved_setting.json',
      )
      console.log(savedSetting)

      if (saveSetting) {
        console.log(color('operation', `......Saving setting`))

        try {
          if (!savedSetting.data[interaction.user.id]) {
            savedSetting.data[interaction.user.id] = {}
            savedSetting.data[interaction.user.id][saveSetting] = options
          } else {
            let slots = savedSetting.data[interaction.user.id]
            slots[saveSetting] = options
            savedSetting.data[interaction.user.id] = slots
          }

          savedSetting.updatedAt = newDate
          console.log(savedSetting)
          fs.writeFileSync('./saved_setting.json', JSON.stringify(savedSetting))
          console.log(color('operation', `Setting saved`))
        } catch (e) {
          console.log(e)
        }
      }

      if (fileAttachment) {
        console.log(color('operation', `......initializing img2img options`))

        let img = ''
        await fetch(fileAttachment.url).then(async res => {
          //  if you want to save incoming img

          // new Promise((resolve, reject) => {
          //   const fileStream = fs.createWriteStream('./img/temp.png')
          //   res.body.pipe(fileStream)
          //   res.body.on('error', err => {
          //     fileStream.close()
          //     reject(err)
          //   })
          //   fileStream.on('finish', function () {
          //     fileStream.close()
          //     resolve()
          //   })
          // })

          await res.buffer().then(bff => {
            img = bff.toString('base64')
          })
        })

        // recalculate WxH
        let tempW = Math.floor((fileAttachment.width as number) / 64) * 64
        let tempH = Math.floor((fileAttachment.height as number) / 64) * 64

        if (tempH >= tempW) {
          // portrait or square
          if (tempH > 1024) {
            tempW = Math.floor(((1024 / tempH) * tempW) / 64) * 64
            tempH = 1024
          }
        } else {
          // landscape
          if (tempW > 1024) {
            tempH = Math.floor(((1024 / tempW) * tempH) / 64) * 64
            tempW = 1024
          }
        }

        img2imgOptions = {
          steps: config.default.img2imgStep, // this should not be changed
          strength:
            interaction.options.getNumber('strength') ||
            config.default.strength,
          noise: interaction.options.getNumber('noise') || config.default.noise,
          image: img,
          width: tempW,
          height: tempH,
        }

        console.log(color('operation', `img2img options initialized`))
      }

      let settingExist = true

      if (getSetting) {
        if (savedSetting.data[interaction.user.id]) {
          console.log(
            color(
              'operation',
              `......applying setting saved on slot ${getSetting}`,
            ),
          )

          let slots = savedSetting.data[interaction.user.id]
          if (slots[getSetting]) {
            options = slots[getSetting]
            console.log(
              color('operation', `saved setting slot ${getSetting} applied`),
            )
          } else {
            settingExist = false
          }
        } else {
          settingExist = false
        }
      }

      if (settingExist) {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({ name: 'Image Info' })
              .setDescription(
                `Prompt received. ${
                  getSetting ? 'Using of slot ' + getSetting + '.' : ''
                }\nYour prompt is: ${options.positivePrompt.replace(config.default.positive, '')}${
                  fileAttachment ? '\nUsing img2img' : ''
                }\nWith scale ${options.scale} steps ${
                  options.steps
                }\nImage size: ${
                  fileAttachment
                    ? img2imgOptions.width
                    : config.sizeMapper[options.orientation][options.size].width
                }x${
                  fileAttachment
                    ? img2imgOptions.height
                    : config.sizeMapper[options.orientation][options.size]
                        .height
                }\nNumber: ${sampleNumber || 1}\nSeed: ${
                  seed ? seed : randomSeed
                }\nPlease wait for a moment...`,
              )
              .setColor(getThemeColor('text')),
          ],
        })

        console.log(color('operation', `......making payload`))
        const payload:Payload = {
          prompt: options.positivePrompt,
          width: config.sizeMapper[options.orientation][options.size].width,
          height: config.sizeMapper[options.orientation][options.size].height,
          scale: options.scale,
          sampler: 'k_euler_ancestral',
          steps: options.steps,
          seed: seed || randomSeed,
          n_samples: sampleNumber || 1,
          ucPreset: 0,
          uc: options.negativePrompt,
          ...img2imgOptions,
        }

        if(payload.image) {
          console.log(_.omit(payload, ['image']))
        } else {
          console.log(payload)
        }
        

        const res = await fetch(
          process.env.BASE_URL + config.generateImageURL,
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          },
        )

        console.log(
          color('operation', `......waiting for server to return image`),
        )

        res.text().then(data => {
          const str = data.toString()

          const splitArr = str.split('event: newImage')

          let fileArr: AttachmentBuilder[] = []
          // let embedArr = []
          splitArr
            .map(arr => arr.trim())
            .forEach(img => {
              if (img.length > 0) {
                const index = img.indexOf('data:')
                const newStr = img.substring(index + 5)
                const imgBuff = Buffer.from(newStr, 'base64')
                newDate = moment().format('YY-MM-DD-hh-mm-ss')
                const ran = Math.random() * 10
                const file = new AttachmentBuilder(imgBuff, {
                  name: `${newDate + ran}.png`,
                })
                // const exampleEmbed = new EmbedBuilder()
                //   .setTitle(newDate)
                //   .setImage('attachment://discordjs.png')
                fileArr.push(file)
                // embedArr.push(exampleEmbed)
              }
            })

          console.log(color('operation', `......sending image`))
          interaction.editReply({
            // embeds: [...embedArr],
            files: [...fileArr],
          })
        })
        //   // If you want to save to local

        //   // fs.promises
        //   //   .writeFile(
        //   //     `./img/{newDate}.jpg`,
        //   //     newStr,
        //   //     'base64',
        //   //     function (err) {
        //   //       console.log(err)
        //   //     },
        //   //   )
        //   //   .then(() => {
        //   //     const file = new AttachmentBuilder(
        //   //       `./img/{newDate}.jpg`,
        //   //     )
        //   //     const exampleEmbed = new EmbedBuilder()
        //   //       .setTitle(newDate)
        //   //       .setImage('attachment://discordjs.png')

        //   //     interaction.editReply({ embeds: [exampleEmbed], files: [file] })
        //   //   })
        // })
      } else {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({ name: 'Setting not found' })
              .setDescription(`Selected setting does not exist`)
              .setColor(getThemeColor('error')),
          ],
        })
      }
    }
  },
  cooldown: config.cooltime,
}

export default prompt
