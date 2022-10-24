import { Config } from "types";

export const config:Config = {
  generateImageURL: '/generate-stream',
  sizeMapper: {
    portrait: {
      medium: {
        height: 768,
        width: 512,
      },
      large: {
        height: 1024,
        width: 512,
      },
      small: {
        height: 640,
        width: 384,
      },
    },
    landscape: {
      medium: {
        height: 512,
        width: 768,
      },
      large: {
        height: 512,
        width: 1024,
      },
      small: {
        height: 384,
        width: 640,
      },
    },
    square: {
      medium: {
        height: 512,
        width: 512,
      },
      large: {
        height: 1024,
        width: 1024,
      },
      small: {
        height: 512,
        width: 512,
      },
    },
  },
  default: {
    positive: 'masterpiece, best quality, ',
    negative:
      'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, (((ugly))), (((duplicate))), (((morbid))), (((mutilated))), (((tranny))), (trans), (hermaphrodite), [out of frame], extra fingers, mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), bad anatomy, bad hands, text, missing fingers, fused fingers, one hand with more than 5 fingers, one hand with less than 5 fingers, signature, watermark, username, multiple breasts, (long body :1.3), black-white, bad anatomy, malformed, mutated, malformed hands, long neck, blurred, lowers, lowres, bad anatomy, uncoordinated body, unnatural body, fused breasts, bad breasts, huge breasts, poorly drawn breasts, extra breasts, more than 2 nipples, missing nipples, bad eyes, fused eyes, poorly drawn eyes, bad shoes, fused shoes, more than two shoes, poorly drawn shoes, malformed feet,',
    orientation: 'portrait',
    size: 'medium',
    strength: 0.7,
    noise: 0.2,
    steps: 28,
    img2imgStep: 50,
    scale: 12,
  },
}
