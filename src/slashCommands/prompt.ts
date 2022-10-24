import {
  AttachmentBuilder,
} from 'discord.js'
import { buildSlashCommand, getThemeColor } from 'utils/functions'
import {
  Img2imgOptions,
  Options,
  Orientation,
  SavedSetting,
  Size,
  SlashCommand,
} from 'types'
import { config, promptConfig } from 'constant'
import moment from 'moment'
import { getJsonFileFromPath } from 'utils'
import fs from 'fs'
import fetch from 'node-fetch'

const prompt: SlashCommand = {
  command: buildSlashCommand(promptConfig),
  execute: async interaction => {
    if (interaction.isChatInputCommand()) {
      console.log('Prompt received')
      let newDate = moment().format('YY-MM-DD-hh-mm-ss')
      console.log(
        '=================================getting input========================================',
      )

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
      }

      const fileAttachment = interaction.options.getAttachment('img2img')
      const saveSetting = interaction.options.getNumber('save_setting')
      const getSetting = interaction.options.getNumber('get_setting')
      const sampleNumber = interaction.options.getNumber('number')
      let img2imgOptions: Img2imgOptions = {}
      console.log(options)

      const savedSetting: SavedSetting = await getJsonFileFromPath(
        'saved_setting.json',
      )

      if (saveSetting) {
        console.log(
          '================================saving setting=======================================',
        )
        let slots = savedSetting.data[interaction.user.id] || {}
        slots[saveSetting] = options
        savedSetting.data[interaction.user.id] = slots
        savedSetting.updatedAt = newDate

        fs.writeFile('saved_setting.json', JSON.stringify(savedSetting), err =>
          console.log(err),
        )
        console.log('setting saved')
      }

      if (fileAttachment) {
        console.log(
          '===============================initializing img2img options===========================',
        )

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
          steps: config.default.img2imgStep,
          strength:
            interaction.options.getNumber('strength') ||
            config.default.strength,
          noise: interaction.options.getNumber('noise') || config.default.noise,
          image: img,
          width: tempW,
          height: tempH,
        }
      }

      if (getSetting && savedSetting.data[interaction.user.id]) {
        console.log(
          `======================applying setting saved on slot ${getSetting}===================`,
        )

        let slots = savedSetting.data[interaction.user.id]
        options = slots[getSetting]

        console.log('setting applied')

        interaction.reply(`Using saved setting slot ${getSetting}.\nYour prompt is: ${
          options.positivePrompt
        }\nImage size: ${
          config.sizeMapper[options.orientation][options.size].width
        }x${config.sizeMapper[options.orientation][options.size].height}
            \nPlease wait for a moment...`)
      } else {
        interaction.reply(`Prompt received.\nYour prompt is: ${
          options.positivePrompt
        }\nImage size: ${
          fileAttachment
            ? img2imgOptions.width
            : config.sizeMapper[options.orientation][options.size].width
        }x${
          fileAttachment
            ? img2imgOptions.height
            : config.sizeMapper[options.orientation][options.size].height
        }
            \nPlease wait for a moment...`)
      }

      console.log(
        '=====================================making payload===========================================',
      )
      const payload = {
        prompt: options.positivePrompt,
        width: config.sizeMapper[options.orientation][options.size].width,
        height: config.sizeMapper[options.orientation][options.size].height,
        scale: config.default.scale,
        sampler: 'k_euler_ancestral',
        steps: config.default.steps,
        seed: Math.floor(Math.random() * 2 ** 32 - 1),
        n_samples: sampleNumber || 1,
        ucPreset: 0,
        uc: options.negativePrompt,
        ...img2imgOptions,
      }

      console.log(payload)

      const res = await fetch(process.env.BASE_URL + config.generateImageURL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      console.log(
        '===============================waiting for image generation====================================',
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

        console.log(
          '======================================sending image==========================================',
        )
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
    }
  },
  cooldown: 20,
}

export default prompt
