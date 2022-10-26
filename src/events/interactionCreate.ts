import { color, getImageResult } from './../utils/functions'
import { config } from './../constant/config'
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Interaction,
} from 'discord.js'
import { BotEvent } from 'types'
import fetch from 'node-fetch'
import _ from 'lodash'

const event: BotEvent = {
  name: 'interactionCreate',
  execute: async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      let command = interaction.client.slashCommands.get(
        interaction.commandName,
      )
      let cooldown = interaction.client.cooldowns.get(
        `${interaction.commandName}-${interaction.user.username}`,
      )
      if (!command) return
      if (command.cooldown && cooldown) {
        if (Date.now() < cooldown) {
          interaction.reply(
            `You have to wait ${Math.floor(
              Math.abs(Date.now() - cooldown) / 1000,
            )} second(s) to use this command again.`,
          )
          setTimeout(() => interaction.deleteReply(), 5000)
          return
        }
        interaction.client.cooldowns.set(
          `${interaction.commandName}-${interaction.user.username}`,
          Date.now() + command.cooldown * 1000,
        )
        setTimeout(() => {
          interaction.client.cooldowns.delete(
            `${interaction.commandName}-${interaction.user.username}`,
          )
        }, command.cooldown * 1000)
      } else if (command.cooldown && !cooldown) {
        interaction.client.cooldowns.set(
          `${interaction.commandName}-${interaction.user.username}`,
          Date.now() + command.cooldown * 1000,
        )
      }
      command.execute(interaction)
    } else if (interaction.isButton()) {
      console.log('===========================================')
      console.log(color('operation', `......re-generating image by old config`))
      const retryBtn = new ButtonBuilder()
        .setCustomId('retry')
        .setLabel('loading...')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true)

      let retry = new ActionRowBuilder<ButtonBuilder>().addComponents(retryBtn)

      interaction.update({
        content: 'retrying...',
        files: [],
        components: [retry],
      })
      // console.log(interaction.message.embeds)
      const embedbody = interaction.message.embeds[0]

      // console.log(embedbody)
      // console.log(embedbody.fields.find((f:any) => f.name === 'JSON'))
      const payload = {
        ...JSON.parse(
          embedbody.fields.find((f: any) => f.name === 'JSON')!.value,
        ),
        prompt: embedbody.description?.replaceAll('```', '')?.trim(),
        ucPreset: 0,
        uc: embedbody.fields
          .find((f: any) => f.name === 'Negative Prompt')
          ?.value?.toString()
          .replaceAll('```', '')
          ?.trim(),
        sampler: 'k_euler_ancestral',
        seed: Math.floor(Math.random() * 2 ** 32 - 1),
      }
      if (payload.uc === 'using default negative prompt') {
        payload.uc = config.default.negative
      }

      if (embedbody.image) {
        await fetch(embedbody.image.url).then(async res => {
          await res.buffer().then(bff => {
            payload.image = bff.toString('base64')
          })
        })
        console.log(_.omit(payload, ['image']))
      } else {
        console.log(payload)
      }
      console.log(
        color('operation', `......waiting for server to return image`),
      )
      const files = await getImageResult(payload)
      console.log(color('operation', `......sending image`))
      const enableRetryBtn = new ButtonBuilder()
        .setCustomId('retry')
        .setLabel('retry')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(false)

      retry = new ActionRowBuilder<ButtonBuilder>().addComponents(
        enableRetryBtn,
      )
      interaction.editReply({
        content: 'need extreme segs',
        files: [...files],
        components: [retry],
      })
    } else {
      return
    }
  },
}

export default event
