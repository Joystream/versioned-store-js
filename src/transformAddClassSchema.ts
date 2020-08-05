import { AddClassSchemaInputType, AddClassSchemaOutputType } from './types/AddClassSchemaTypes';
import { validateAddClassSchema } from './validate';
import ClassId from '@joystream/types/versioned-store/ClassId';
import { Property, VecU16, VecProperty } from '@joystream/types/versioned-store';
import { u16, bool as Bool, Text } from '@polkadot/types';
import { TransformationResult, wrapValidationErrors } from './transform';
import { PropertyByNameMap } from './types/PropertyTypes';
import { transformPropertyType } from './transformPropertyType';

export function transformAddClassSchema(
  inputData: AddClassSchemaInputType,
  propMap: PropertyByNameMap
): TransformationResult<string[], AddClassSchemaOutputType> {

  const classIdToNumber = Number(inputData.classId)
  inputData.classId = classIdToNumber

  const validation = validateAddClassSchema(inputData);
  if (!validation.valid) {
    return wrapValidationErrors(validation)
  }

  const allErrors: string[] = [];

  const existingProps: u16[] = [];
  inputData.existingProperties && inputData.existingProperties.forEach(propName => {
    if (propMap.has(propName)) {
      const propIndex = propMap.get(propName).index;
      existingProps.push(new u16(propIndex));
    } else {
      allErrors.push(`No property index provided for name '${propName}'.`);
    }
  });

  const newProps: Property[] = [];
  inputData.newProperties && inputData.newProperties.forEach(prop => {
    const { error, result: prop_type } = transformPropertyType(prop);
    if (error) {
      allErrors.push(error)
    } else {
      newProps.push(new Property({
        prop_type,
        required: new Bool(prop.required),
        name: new Text(prop.name),
        description: new Text(prop.description)
      }));
    }
  });

  if (allErrors.length) {
    return { error: allErrors };
  }

  return {
    result: {
      class_id: new ClassId(inputData.classId),
      existing_properties: new VecU16(existingProps),
      new_properties: new VecProperty(newProps)
    }
  }
}
