import { REST, Routes } from 'discord.js'
import { environment } from './environment.js'

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
  {
    name: 'prompt',
    description: 'Input prompt for NAI',
    options: [
      {
        name: 'positive',
        description: 'Positive prompt. Default added will: masterpiece, best quality',
        type: 3,
        max_length: 800,
      },
      {
        name: 'negative',
        description: 'Negative prompt. Default applied some prompt to filter bad result.',
        type: 3,
        max_length: 800,
      },
      {
        name: 'img2img',
        description: 'img2img.',
        type: 11,
      },
      {
        name: 'strength',
        description: 'img2img option: Control how much the image will change. Default 0.7',
        type: 10,
        min_value: 0.1,
        max_value: 0.99,
      },
      {
        name: 'noise',
        description: 'img2img option: Control how much detail will be added. Default 0.2',
        type: 10,
        min_value: 0.1,
        max_value: 0.99,
      },
      {
        name: 'step',
        description: 'Number of iteration to refine image. Default 28 for text2img. Default 50 for img2img',
        type: 10,
        min_value: 1,
        max_value: 50,
      },
      {
        name: 'scale',
        description:
          'Creativity scale. Higher closer to prompt, Lower more creative. Default 12',
        type: 10,
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
        type: 3,
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
        type: 3,
      },
      {
        name: 'save_setting',
        description: 'Save setting to slot 1-5. Will save prompt, orientation and size',
        choices: [
          {
            name: 'slot 1',
            value: 1,
          },
          {
            name: 'slot 2',
            value: 2,
          },
          {
            name: 'slot 3',
            value: 3,
          },
          {
            name: 'slot 4',
            value: 4,
          },
          {
            name: 'slot 5',
            value: 5,
          },
        ],
        type: 10,
      },
      {
        name: 'get_setting',
        description: 'Set setting from slot 1-5',
        choices: [
          {
            name: 'slot 1',
            value: 1,
          },
          {
            name: 'slot 2',
            value: 2,
          },
          {
            name: 'slot 3',
            value: 3,
          },
          {
            name: 'slot 4',
            value: 4,
          },
          {
            name: 'slot 5',
            value: 5,
          },
        ],
        type: 10,
      },
    ],
  },
]

const rest = new REST({ version: '10' }).setToken(environment.token)

;(async () => {
  try {
    console.log('Started refreshing application (/) commands.')

    await rest.put(Routes.applicationCommands(environment.clientId), {
      body: commands,
    })

    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error(error)
  }
})()
