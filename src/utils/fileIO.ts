import fs from 'fs'
import moment from 'moment'


export async function getJsonFileFromPath(filePath: string) {
    const newDate = moment().format('YY-MM-DD-hh-mm-ss')
    const newJson = { updatedAt: newDate, data: {} }
    try {
      // for saving setting
      if (fs.existsSync(filePath)) {
        fs.promises
          .readFile(filePath)
          .then(json => {
            return JSON.parse(json.toString())
          })
      } else {

        fs.writeFile(
          'saved_setting.json',
          JSON.stringify(newJson),
          err => console.log(err),
        )
        return newJson
      }
    } catch (e) {
      console.log(e)
      console.log('Error: error when getting saved setting')
    }

    return newJson
  }