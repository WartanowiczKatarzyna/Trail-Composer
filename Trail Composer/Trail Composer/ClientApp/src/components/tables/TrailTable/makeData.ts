import { faker } from '@faker-js/faker';
import { TrailRowData } from './TrailRowData';

const range = (len: number) => {
  const arr: number[] = []
  for (let i = 0; i < len; i++) {
    arr.push(i)
  }
  return arr
}

const newRowData = (d:number): TrailRowData => {
  const trailTypeIdsSize = faker.number.int({min: 1, max: 3});
  const trailTypeIds : number[] = [];
  for (let i=1; i<trailTypeIdsSize; i++){
    trailTypeIds.push(faker.number.int({min: 2, max: 4}));
  };
  return {
    id: d+1000,
    name: faker.lorem.word({ length: { min: 1, max: 50 } }),
    username: faker.lorem.word({ length: { min: 1, max: 50 } }),
    length: faker.number.float({ min: 0, max: 500, fractionDigits: 6 }),
    countryId: faker.number.int({min: 1, max: 4}),
    trailTypeIds: trailTypeIds,
    level: faker.helpers.shuffle<TrailRowData['level']>([
      'łatwy',
      'średni',
      'zaawansowany',
    ])[0]!,
  };
}

export function makeData(...lens: number[]) {
  const makeDataLevel = (depth = 0): TrailRowData[] => {
    const len = lens[depth]!
    return range(len).map((d): TrailRowData => {
      
      return {
        ...newRowData(d),
        subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
      }
    })
  }

  return makeDataLevel()
}
