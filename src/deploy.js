import { REST, Routes } from 'discord.js'
import {environment} from './environment.js'

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
        description: 'positive prompt',
        type: 3,
        required: true
      },
    ]
  },
  {
    name: 'img2img',
    description: 'img2img',
  },
];

const rest = new REST({ version: '10' }).setToken(environment.token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(environment.clientId), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();