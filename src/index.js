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

// client.on(Events.MessageCreate, async message => {
//     console.log('messageCreate')
//     console.log(message)
//   });

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
          let receivedPrompt = interaction.options.getString('positive')
          console.log(receivedPrompt)

          const splitted = receivedPrompt.split('|')
          let orientation = ''
          let width = config.default.portrait.mid.width
          let height = config.default.portrait.mid.height
          let scale = ''

          if (splitted.length > 2) {
            orientation = splitted[1].trim()
            scale = splitted[2].trim()
            if (
              Object.keys(config.default).includes(orientation) &&
              Object.keys(config.default.portrait).includes(scale)
            ) {
              width = config.default[orientation][scale].width
              height = config.default[orientation][scale].height
            }
          }

          interaction.reply(
            `Your prompt is: ${receivedPrompt}\nImage size: ${width}x${height}\nPlease wait for a moment...`,
          )

          const payload = {
            prompt: splitted[0],
            width: width,
            height: height,
            scale: 12,
            sampler: 'k_euler_ancestral',
            steps: 28,
            seed: Math.floor(Math.random() * 2 ** 32 - 1),
            n_samples: 1,
            ucPreset: 0,
            uc: config.negative,
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

          res.text().then(data => {
            const str = data.toString()
            const index = str.indexOf('data:')
            const newStr = str.substring(index + 5)

            const newDate = moment().format('YY-MM-DD-hh-mm-ss')
            const imgBuff = new Buffer.from(newStr, 'base64')

            const file = new AttachmentBuilder(imgBuff, {
              name: `${newDate}.jpg`,
            })
            const exampleEmbed = new EmbedBuilder()
              .setTitle(newDate)
              .setImage('attachment://discordjs.png')

            interaction.editReply({ embeds: [exampleEmbed], files: [file] })

            // If you want to save to local

            // fs.promises
            //   .writeFile(
            //     `C:/Users/nakag/Documents/GitHub/NAI-discord-bot/img/${newDate}.jpg`,
            //     newStr,
            //     'base64',
            //     function (err) {
            //       console.log(err)
            //     },
            //   )
            //   .then(() => {
            //     const file = new AttachmentBuilder(
            //       `C:/Users/nakag/Documents/GitHub/NAI-discord-bot/img/${newDate}.jpg`,
            //     )
            //     const exampleEmbed = new EmbedBuilder()
            //       .setTitle(newDate)
            //       .setImage('attachment://discordjs.png')

            //     interaction.editReply({ embeds: [exampleEmbed], files: [file] })
            //   })
          })

          break
      }
    } catch (err) {
      interaction.editReply(err)
    }
  } else {
    return
  }
})

client.login(environment.token)
