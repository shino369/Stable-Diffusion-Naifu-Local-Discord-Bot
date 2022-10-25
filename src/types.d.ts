export * from './interface/index'

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOKEN: string
      CLIENT_ID: string
      BASE_URL: string
      ROOTNAME: string
      BUILD_ROOTNAME: string
      EXT: string
      BUILD_EXT: string
    }
  }
}
