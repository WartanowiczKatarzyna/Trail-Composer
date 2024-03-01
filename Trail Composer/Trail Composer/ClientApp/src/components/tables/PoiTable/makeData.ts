import { faker } from '@faker-js/faker'

export type RowData = {
  name: string
  longitude: number
  age: number
  visits: number
  progress: number
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
    age: faker.number.int(40),
    visits: faker.number.int(1000),
    progress: faker.number.int(100),
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
