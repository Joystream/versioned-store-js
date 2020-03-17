import { Text } from '@polkadot/types';
import { validateCreateClass } from './validate';
import { CreateClassInputType, CreateClassOutputType } from './types/CreateClassTypes';
import { TransformationResult, wrapValidationErrors } from './transform';

export function transformCreateClass(
  inputData: CreateClassInputType
): TransformationResult<string[], CreateClassOutputType> {
  
  const validation = validateCreateClass(inputData);
  if (!validation.valid) {
    return wrapValidationErrors(validation)
  }

  return {
    result: {
      name: new Text(inputData.name),
      description: new Text(inputData.description)
    }
  }
}
