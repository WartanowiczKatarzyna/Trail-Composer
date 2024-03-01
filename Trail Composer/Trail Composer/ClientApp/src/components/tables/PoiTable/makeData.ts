import { faker } from '@faker-js/faker'

export type RowData = {
  name: string
  longitude: number
  latitude: number
  description: string
  countryId: number
  status: 'relationship' | 'complicated' | 'single'
  subRows?: RowData[]
}

const range = (len: number) => {
  const arr: number[] = []
  for (let i = 0; i < len; i++) {
    arr.push(i)
  }
  return arr
}

const newRowData = (): RowData => {
  return {
    name: faker.lorem.word({ length: { min: 1, max: 50 } }),
    longitude: faker.number.float({ min: -180, max: 180, fractionDigits: 6 }),
    latitude: faker.number.float({ min: -90, max: 90, fractionDigits: 6 }),
    description: faker.lorem.paragraph({min: 0, max:10}),
    countryId: faker.number.int({min: 1, max: 35}),
    status: faker.helpers.shuffle<RowData['status']>([
      'relationship',
      'complicated',
      'single',
    ])[0]!,
  }
}

export function makeData(...lens: number[]) {
  const makeDataLevel = (depth = 0): RowData[] => {
    const len = lens[depth]!
    return range(len).map((d): RowData => {
      
      return {
        ...newRowData(),
        subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
      }
    })
  }

  return makeDataLevel()
}
