import {
  Client,
  GatewayIntentBits,
  Events,
  Partials,
  AttachmentBuilder,
  EmbedBuilder,
} from 'discord.js'
import fetch from 'node-fetch'
import fs from 'fs'
import moment from 'moment/moment.js'
import { config } from './config.js'
import { environment } from './environment.js'

let savedSetting = {}

const readSavedSetting = async () => {
  // for saving setting
  if (fs.existsSync('saved_setting.json')) {
    fs.promises
      .readFile('saved_setting.json', err => console.log(err))
      .then(json => {
        savedSetting = JSON.parse(json)
      })
  } else {
    fs.writeFile(
      'saved_setting.json',
      JSON.stringify({ updatedAt: '', data: {} }),
      err => console.log(err),
    )
  }
}

function main() {
  readSavedSetting()

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel, Partials.Message],
  })

  client.on(Events.ClientReady, () => {
    if (client.user) {
      console.log(`Logged in as ${client.user.tag}!`)
    }
  })

  client.on(Events.MessageCreate, async message => {
    try {
      // only response to user message
      if (!message.author.bot) {
        message.reply(
          `Hello ${message.author.username}! I'm a robot which generate illustration.`,
        )
      }
    } catch (err) {
      message.reply('Message Error: Internal error occured.')
    }
  })

  client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
      try {
        switch (interaction.commandName) {
          case 'ping':
            const msg = await interaction.reply({
              content: 'Calculating delay......',
              fetchReply: true,
            })

            const ping = msg.createdTimestamp - interaction.createdTimestamp

            interaction.editReply(
              `delay ${ping} ms\nAPI delay：${client.ws.ping} ms`,
            )
            break
          case 'prompt':
            console.log('Prompt received')
            const newDate = moment().format('YY-MM-DD-hh-mm-ss')
            console.log(
              '=================================getting input========================================',
            )

            let options = {
              positivePrompt: interaction.options.getString('positive')
                ? config.default.positive +
                  interaction.options.getString('positive')
                : config.default.positive,
              negativePrompt:
                interaction.options.getString('negative') ||
                config.default.negative,
              orientation:
                interaction.options.getString('orientation') ||
                config.default.orientation,
              size:
                interaction.options.getString('size') || config.default.size,
            }

            const fileAttachment = interaction.options.getAttachment('img2img')
            const saveSetting = interaction.options.getNumber('save_setting')
            const getSetting = interaction.options.getNumber('get_setting')
            let img2imgOptions = {}
            console.log(options)

            if (saveSetting) {
              console.log(
                '================================saving setting=======================================',
              )

              let slots = savedSetting.data[interaction.user.id] || {}
              slots[saveSetting] = options
              savedSetting.data[interaction.user.id] = slots
              savedSetting.updatedAt = newDate

              fs.writeFile(
                'saved_setting.json',
                JSON.stringify(savedSetting),
                function (err) {
                  console.log(err)
                },
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
              let tempW = Math.floor(fileAttachment.width / 64) * 64
              let tempH = Math.floor(fileAttachment.height / 64) * 64

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
                noise:
                  interaction.options.getNumber('noise') ||
                  config.default.noise,
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
              height:
                config.sizeMapper[options.orientation][options.size].height,
              scale: config.default.scale,
              sampler: 'k_euler_ancestral',
              steps: config.default.steps,
              seed: Math.floor(Math.random() * 2 ** 32 - 1),
              n_samples: 1,
              ucPreset: 0,
              uc: options.negativePrompt,
              ...img2imgOptions,
            }

            console.log(payload)

            const res = await fetch(config.baseUrl + '/generate-stream', {
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
              const index = str.indexOf('data:')
              const newStr = str.substring(index + 5)
              const imgBuff = new Buffer.from(newStr, 'base64')

              const file = new AttachmentBuilder(imgBuff, {
                name: `${newDate}.png`,
              })
              const exampleEmbed = new EmbedBuilder()
                .setTitle(newDate)
                .setImage('attachment://discordjs.png')

              console.log(
                '======================================sending image==========================================',
              )
              interaction.editReply({ embeds: [exampleEmbed], files: [file] })
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

            break
        }
      } catch (err) {
        interaction.reply('Interaction Error: Internal error occured.')
        return
      }
    } else {
      return
    }
    return
  })

  client.login(environment.token)
}

main()
