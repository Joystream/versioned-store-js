//import { PropertyTypeName } from '@joystream/types/versioned-store/PropertyTypeName';
/*
function stringToArray(input:string) {
  const array:string[] = []
  input.split(',').forEach((value:string) => { 
    array.push(value)
  })
  return array
}
function makePropNameType(input:string): PropertyTypeName {
  let output:PropertyTypeName
  switch (input) {
    case 'None':
    case 'Bool':
    case 'Uint16':
    case 'Uint32':
    case 'Uint64':
    case 'Int16':
    case 'Int32':
    case 'Int64':
    case 'Text':
    case 'Internal':
    case 'BoolVec':
    case 'Uint16Vec':
    case 'Uint32Vec':
    case 'Uint64Vec':
    case 'Int16Vec':
    case 'Int32Vec':
    case 'Int64Vec':
    case 'TextVec':
    case 'InternalVec':
      console.log("input",input)
      output = input as unknown as PropertyTypeName
      console.log("output",output)
    default: {
      throw new Error(`Invalid property type: ${input}`)
    }
  }
  console.log("input2",input)
  console.log("output2",output)
  return output
}
*/


export const createClassQuestions: Array<Object> = [
  {
      type: `input`,
      name: `name`,
      prefix: `- `,
      message: `Enter the name of the class:
        Video `,
      suffix: ` > `
  },
  {
      type: `input`,
      name: `description`,
      prefix: `- `,
      message: `Enter the description of the class:
        Some Description `,
      suffix: ` > `
  }
]
/*

export const createSchemaQ1: Array<Object> = [
  {
      type: `input`,
      name: `classId`,
      prefix: `- `,
      message: `Enter the name of the class:
        Video `,
      suffix: ` > `
  }
]

export const createSchemaQ2: Array<Object> = [
  {
      type: `input`,
      name: `existingProperties`,
      prefix: `- `,
      message: `Enter the names of the existing properties the schema shall include,
      as a comma separeted list in the preferred order:
        Title,Thumbnail
      Leave blank if no existing properties is wanted.`,
      suffix: ` > `,
      filter: (input:string) => stringToArray(input)
  }
]

export const createSchemaQ3: Array<Object> = [
  {
    type: `number`,
    name: `number`,
    prefix: `- `,
    message: `Enter the number of new properties:
      3 `,
    default: 0,
    suffix: ` > `
  }
]

export const createSchemaQ4: Array<Object> = [
  {
    type: `input`,
    name: `name`,
    prefix: `- `,
    message: `Enter the name of the property:`,
    suffix: ` > `
  },
  {
    type: `input`,
    name: `type`,
    prefix: `- `,
    message: `Enter the type of Property (see PropertyTypeName) Example:
      Bool `,
    suffix: ` > `,
    filter: (input:string) => makePropNameType(input)
  },
  {
    type: `input`,
    name: `description`,
    prefix: `- `,
    message: `Enter the description:
      Title of Something `,
    suffix: ` > `
  },
  {
    type: `confirm`,
    name: `required`,
    prefix: `- `,
    message: `Required property?:`,
    default: false,
    suffix: ` > `,
  },
  {
    type: `input`,
    name: `classId`,
    prefix: `- `,
    message: `If 'type' is Internal or InternalVec, use the name of the class:
      Video `,
    default: undefined,
    suffix: ` > `
  },
  {
    type: `number`,
    name: `maxItems`,
    prefix: `- `,
    message: `If 'type' is '*Vec' set the max number of elements in the array:
      5 `,
    default: null,
    suffix: ` > `
  },
  {
    type: `number`,
    name: `maxTextLength`,
    prefix: `- `,
    message: `If 'type' is 'Text' or 'TextVec' set the max number of characters:
      256 `,
    default: null,
    suffix: ` > `
  }
]
*/