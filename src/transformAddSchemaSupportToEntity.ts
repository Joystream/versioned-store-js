import { validateAddSchemaSupportToEntity } from './validate';
import { ClassPropertyValue, VecClassPropertyValue } from '@joystream/types/lib/versioned-store';
import { u16 } from '@polkadot/types';
import { AddSchemaSupportToEntityInputType, AddSchemaSupportToEntityOutputType } from './types/AddSchemaSupportToEntityTypes';
import EntityId from '@joystream/types/lib/versioned-store/EntityId';
import { TransformationResult, wrapValidationErrors } from './transform';
import { PropertyByNameMap } from './types/PropertyTypes';
import { transformPropertyValue } from './transformPropertyValue';

export function transformAddSchemaSupportToEntity(
  inputData: AddSchemaSupportToEntityInputType,
  propMap: PropertyByNameMap
): TransformationResult<string[], AddSchemaSupportToEntityOutputType> {
  
  const validation = validateAddSchemaSupportToEntity(inputData);
  if (!validation.valid) {
    return wrapValidationErrors(validation)
  }

  const allErrors: string[] = [];
  const propValues: ClassPropertyValue[] = [];

  // TODO refactor copypasta from 'transformUpdateEntityPropertyValues'
  inputData.propertyValues && inputData.propertyValues.forEach(prop => {
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
      schema_id: new u16(inputData.schemaId),
      property_values: new VecClassPropertyValue(propValues)
    }
  }
}
