import { ValidationResult } from './validate'

export type TransformationResult<E, R> = {
  error?: E
  result?: R
}

export function wrapValidationErrors<R> (validation: ValidationResult): TransformationResult<string[], R> {
  const { errors } = validation
  return {
    error: [
      `Schema validation failed with ${errors.length} errors.` 
    ].concat(errors)
  }
}

export * from './transformCreateClass'
export * from './transformAddClassSchema'
export * from './transformCreateEntity'
export * from './transformAddSchemaSupportToEntity'
export * from './transformUpdateEntityPropertyValues'