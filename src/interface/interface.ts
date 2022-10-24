import {
  SlashCommandBuilder,
  CommandInteraction,
  Collection,
  PermissionResolvable,
  Message,
  ApplicationCommandOptionType,
} from 'discord.js'

export interface SavedSetting {
  updatedAt: string
  data: {
    // user id
    [key in string]: {
      // slot 1 - 5
      [key in number]: Options
    }
  }
}

export interface Options {
  positivePrompt: string
  negativePrompt: string
  orientation: Orientation
  size: Size
  scale: number
  steps: number
  strength?: number
  noise?: number
}

export type Orientation = 'portrait' | 'landscape' | 'square'

export type Size = 'small' | 'medium' | 'large'

export interface Config {
  generateImageURL: string
  sizeMapper: {
    [key in Orientation]: {
      [key in Size]: {
        height: number
        width: number
      }
    }
  }
  default: {
    positive: string
    negative: string
    orientation: Orientation
    size: Size
    strength: number
    noise: number
    steps: number
    img2imgStep: number
    scale: number
  }
}

export interface Img2imgOptions {
  steps?: number
  strength?: number
  noise?: number
  image?: string // base64 string, very long
  width?: number
  height?: number
}

export interface Payload extends Img2imgOptions{
  width: number
  height: number
  prompt: string
  scale: number
  sampler: string
  seed: number
  n_samples: number
  ucPreset: number
  uc: string
}
//====================discord js types=====================

export interface SlashCommandType {
  name: string
  description: string
  options?: SlashOption[]
}

interface SlashOption {
  name: string
  description: string
  type: ApplicationCommandOptionType
  max_length?: number
  min_length?: number
  min_value?: number
  max_value?: number
  choices?: { name: string; value: string | number }[] | Function
  required?: boolean
}

export interface SlashCommand {
  command: SlashCommandBuilder | any
  execute: (interaction: CommandInteraction) => void
  cooldown?: number // in seconds
}

export interface Command {
  name: string
  execute: (message: Message, args: Array<string>) => void
  permissions: Array<PermissionResolvable>
  aliases: Array<string>
  cooldown?: number
}

interface GuildOptions {
  prefix: string
}

export type GuildOption = keyof GuildOptions
export interface BotEvent {
  name: string
  once?: boolean | false
  execute: (...args: any) => void
}

export interface Client {
  slashCommands: Collection<string, SlashCommand>
  commands: Collection<string, Command>
  cooldowns: Collection<string, number>
}

declare module 'discord.js' {
  export interface Client {
    slashCommands: Collection<string, SlashCommand>
    commands: Collection<string, Command>
    cooldowns: Collection<string, number>
  }
}
