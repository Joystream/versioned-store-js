import { validateCreateEntity } from './validate';
import { CreateEntityInputType, CreateEntityOutputType } from './types/CreateEntityTypes';
import { TransformationResult, wrapValidationErrors } from './transform';
import ClassId from '@joystream/types/versioned-store/ClassId';

export function transformCreateEntity(
  inputData: CreateEntityInputType
): TransformationResult<string[], CreateEntityOutputType> {
  
  const validation = validateCreateEntity(inputData);
  if (!validation.valid) {
    return wrapValidationErrors(validation)
  }

  return {
    result: {
      class_id: new ClassId(inputData.classId)
    }
  }
}
