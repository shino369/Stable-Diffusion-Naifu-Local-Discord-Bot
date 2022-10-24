import fs from 'fs'
import moment from 'moment'

export function getJsonFileFromPath(filePath: string) {
  const newDate = moment().format('YY-MM-DD-hh-mm-ss')
  let newJson = { updatedAt: newDate, data: {} }
  try {
    // for saving setting
    if (fs.existsSync(filePath)) {
      const json = fs.readFileSync(filePath)
      newJson = JSON.parse(json.toString())
    }
  } catch (e) {
    console.log(e)
    console.log('Error: error when getting saved setting')
  } finally {
    return newJson
  }
}
