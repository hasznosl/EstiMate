import * as fs from 'fs'
import { parse, unparse } from 'papaparse'
import * as path from 'path'

const csvFile = fs.readFileSync(`bank.csv`, 'utf8')

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

export const parseCsv = async (): Promise<any> => {

  
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



const writeToFile = (rows: any, filename: string) => {


  const asd = { rows: rows.data }

  const fileDirectory = './export'
  const filePath = path.resolve(fileDirectory, `${filename}.csv`)

  if (!fs.existsSync(fileDirectory)) {
    fs.mkdirSync(fileDirectory)
  }

  fs.writeFileSync(filePath, JSON.stringify(asd))
}

export default async function csvtojson() {
  const data = await  parseCsv()

  writeToFile(data, 'bnk')
}