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
}

export type Orientation = 'portrait' | 'landscape' | 'square'

export type Size = 'small' | 'medium' | 'large'

export interface Config {
  baseUrl: string
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
    image?: string   // base64 string, very long
    width?: number
    height?: number
}