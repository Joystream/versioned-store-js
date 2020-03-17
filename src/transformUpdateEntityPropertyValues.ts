import { validateUpdateEntityPropertyValues } from './validate';
import { ClassPropertyValue, VecClassPropertyValue } from '@joystream/types/lib/versioned-store';
import { u16 } from '@polkadot/types';
import { UpdateEntityPropertyValuesInputType, UpdateEntityPropertyValuesOutputType } from './types/UpdateEntityPropertyValuesTypes';
import EntityId from '@joystream/types/lib/versioned-store/EntityId';
import { TransformationResult, wrapValidationErrors } from './transform';
import { PropertyByNameMap } from './types/PropertyTypes';
import { transformPropertyValue } from './transformPropertyValue';

export function transformUpdateEntityPropertyValues(
  inputData: UpdateEntityPropertyValuesInputType,
  propMap: PropertyByNameMap
): TransformationResult<string[], UpdateEntityPropertyValuesOutputType> {
  
  const validation = validateUpdateEntityPropertyValues(inputData);
  if (!validation.valid) {
    return wrapValidationErrors(validation)
  }

  const allErrors: string[] = [];
  const propValues: ClassPropertyValue[] = [];

  // TODO refactor copypasta from 'transformAddSchemaSupportToEntity'
  inputData.newPropertyValues && inputData.newPropertyValues.forEach(prop => {
    const { name, value } = prop;
    
    if (propMap.has(name)) {
      const propIndex = propMap.get(name).index;
      const propType = propMap.get(name).type;
      const { error, result: propValue } = transformPropertyValue(propType, value);

      if (error) {
        allErrors.push(error);
      } else {
        propValues.push(new ClassPropertyValue({
          in_class_index: new u16(propIndex),
          value: propValue
        }));
      }
    } else {
      allErrors.push(`No property info provided for name '${name}'.`);
    }
  });

  if (allErrors.length) {
    return { error: allErrors };
  }

  return {
    result: {
      entity_id: new EntityId(inputData.entityId),
      new_property_values: new VecClassPropertyValue(propValues)
    }
  }
}
