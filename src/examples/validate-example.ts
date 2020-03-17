import { transformAddClassSchema } from "../transformAddClassSchema";
import { AddClassSchemaInputType } from '../types/AddClassSchemaTypes';
import { PropertyByNameMap } from '../types/PropertyTypes';

const propMap: PropertyByNameMap = new Map([
  ['old_a', { index: 0, type: 'Bool' }],
  ['old_b', { index: 1, type: 'Int16' }]
]);

const inputData: AddClassSchemaInputType = {
  classId: 123,
  existingProperties: [
    'old_a',
    'old_b'
  ],
  newProperties: [
    {
      type: 'Uint16',
      name: 'new_u16',
      description: 'desc. of new_u16'
    },
    {
      type: 'Text',
      required: true,
      name: 'new_text',
      description: 'desc. of new_text',
      maxTextLength: 99
    },
    {
      type: 'TextVec',
      name: 'new_bool_vec',
      description: 'desc. of new_bool_vec',
      maxItems: 45,
      maxTextLength: 99
    }
  ]
}

const transResult = transformAddClassSchema(
  inputData,
  propMap
);

console.log(
  `Call ${transformAddClassSchema.name}`, 
  `\nInput:\n`, 
  JSON.stringify(inputData, null, 2),
  `\nOutput:\n`, 
  JSON.stringify(transResult, null, 2)
);
