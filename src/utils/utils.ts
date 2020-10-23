import { parse, unparse } from 'papaparse'
import * as fs from 'fs'
import * as path from 'path'



const writeToFile = (rows: any[], filename: string) => {

    const csv = unparse(rows)

    const fileDirectory = './export'
    const filePath = path.resolve(fileDirectory, `${filename}.csv`)
  
    if (!fs.existsSync(fileDirectory)) {
      fs.mkdirSync(fileDirectory)
    }
  
    fs.writeFileSync(filePath, csv)
}





function makeCleanKey(key: string): string {
  return key.replace('"', '')
}

function makeCleanValue(value: string): string {
  return typeof value === 'string' ? value.trim() : value
}

function makeCleanRow(row: object): object {
  return Object.entries(row).reduce(
    (accumulator, [key, value]) => ({
      ...accumulator,
      [makeCleanKey(key)]: makeCleanValue(value),
    }),
    {},
  )
}

export default async function parseCsv(): Promise<any> {
  const csvFile = fs.readFileSync(`bank.csv`, 'utf8')


  const { data, ...rest } = (await new Promise((resolve, reject) =>
    parse(csvFile.replace(/^\ufeff/, ''), {
      complete: resolve,
      dynamicTyping: false,
      error: reject,
      header: true,
      skipEmptyLines: true,
    }),
  )) as any

  return {
    ...rest,
    data: data.map(makeCleanRow),
  }
}
