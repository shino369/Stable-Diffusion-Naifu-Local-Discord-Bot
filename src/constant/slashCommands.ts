import { ApplicationCommandOptionType } from 'discord.js'
import { SlashCommandType } from 'types'

export const promptConfig: SlashCommandType = {
  name: 'prompt',
  description: 'Input prompt for NAI',
  options: [
    {
      name: 'positive',
      description:
        'Positive prompt. Default added will: masterpiece, best quality',
      type: ApplicationCommandOptionType.String,
      max_length: 800,
    },
    {
      name: 'negative',
      description:
        'Negative prompt. Default applied some prompt to filter bad result.',
      type: ApplicationCommandOptionType.String,
      max_length: 800,
    },
    {
      name: 'number',
      description: 'Number per generation',
      type: ApplicationCommandOptionType.Number,
      choices: new Array(10).fill(1).map((_num, index) => ({
        name: `${index + 1}`,
        value: index + 1,
      })),
    },
    {
      name: 'img2img',
      description: 'img2img.',
      type: ApplicationCommandOptionType.Attachment,
    },
    {
      name: 'strength',
      description:
        'img2img option: Control how much the image will change. Default 0.7',
      type: ApplicationCommandOptionType.Number,
      min_value: 0.1,
      max_value: 0.99,
    },
    {
      name: 'noise',
      description:
        'img2img option: Control how much detail will be added. Default 0.2',
      type: ApplicationCommandOptionType.Number,
      min_value: 0.1,
      max_value: 0.99,
    },
    {
      name: 'steps',
      description:
        'Number of iteration to refine image. Default 28 for text2img. Default 50 for img2img',
      type: ApplicationCommandOptionType.Number,
      min_value: 1,
      max_value: 50,
    },
    {
      name: 'scale',
      description:
        'Creativity scale. Higher closer to prompt, Lower more creative. Default 12',
      type: ApplicationCommandOptionType.Number,
      min_value: 1,
      max_value: 50,
    },
    {
      name: 'orientation',
      description: 'Orientation. Default portrait',
      choices: [
        {
          name: 'portrait',
          value: 'portrait',
        },
        {
          name: 'landscape',
          value: 'landscape',
        },
        {
          name: 'square',
          value: 'square',
        },
      ],
      type: ApplicationCommandOptionType.String,
    },
    {
      name: 'size',
      description: 'Size. Default medium',
      choices: [
        {
          name: 'large',
          value: 'large',
        },
        {
          name: 'medium',
          value: 'medium',
        },
        {
          name: 'small',
          value: 'small',
        },
      ],
      type: ApplicationCommandOptionType.String,
    },
    {
      name: 'seed',
      description: 'seed of image',
      type: ApplicationCommandOptionType.Number,
      min_value: 0,
      max_value: 4294967295,
    },
    {
      name: 'save_setting',
      description:
        'Save setting to slot 1-5. Will save prompt, orientation and size',
      choices: new Array(10).fill(1).map((_num, index) => ({
        name: `slot ${index + 1}`,
        value: index + 1,
      })),
      type: ApplicationCommandOptionType.Number,
    },
    {
      name: 'get_setting',
      description: 'Set setting from slot 1-5',
      choices: new Array(10).fill(1).map((_num, index) => ({
        name: `slot ${index + 1}`,
        value: index + 1,
      })),
      type: ApplicationCommandOptionType.Number,
    },
  ],
}

export const pingConfig: SlashCommandType = {
  name: 'ping',
  description: 'Show ping',
}

export const nesConfig: SlashCommandType = {
  name: 'nes',
  description: 'Need',
  options: [
    {
      name: 'extreme',
      description: 'extreme',
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: 'SEGS',
          value: 'segs',
        },
        { name: 'SEX', value: 'sex' },
      ],
    },
  ],
}
