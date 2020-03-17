// tslint:disable-next-line:import-name
import Ajv from 'ajv';

import * as CreateClassSchema from './schemas/CreateClass.schema.json'
import * as AddClassSchemaSchema from './schemas/AddClassSchema.schema.json'
import * as CreateEntitySchema from './schemas/CreateEntity.schema.json'
import * as AddSchemaSupportToEntitySchema from './schemas/AddSchemaSupportToEntity.schema.json'
import * as UpdateEntityPropertyValuesSchema from './schemas/UpdateEntityPropertyValues.schema.json'

import { CreateClassInputType } from './types/CreateClassTypes.js';
import { AddClassSchemaInputType } from './types/AddClassSchemaTypes.js';
import { CreateEntityInputType } from './types/CreateEntityTypes.js';
import { AddSchemaSupportToEntityInputType } from './types/AddSchemaSupportToEntityTypes.js';
import { UpdateEntityPropertyValuesInputType } from './types/UpdateEntityPropertyValuesTypes.js'

const ajv = new Ajv({ allErrors: true });

export type ValidationResult = {
  valid: boolean
  errors?: string[]
}

function validationErrorToString (error: Ajv.ErrorObject) {
  return `data${error.dataPath} ${error.message}`;
}

function validateSchema (schema: object | string, inputData: any): ValidationResult {
  const valid = ajv.validate(schema, inputData) as boolean
  const errors = valid
    ? undefined
    : ajv.errors.map(validationErrorToString)

  return { valid, errors };
}

export function validateCreateClass(inputData: CreateClassInputType): ValidationResult {
  return validateSchema(CreateClassSchema, inputData);
}

export function validateAddClassSchema(inputData: AddClassSchemaInputType): ValidationResult {
  return validateSchema(AddClassSchemaSchema, inputData);
}

export function validateCreateEntity(inputData: CreateEntityInputType): ValidationResult {
  return validateSchema(CreateEntitySchema, inputData);
}

export function validateAddSchemaSupportToEntity(inputData: AddSchemaSupportToEntityInputType): ValidationResult {
  return validateSchema(AddSchemaSupportToEntitySchema, inputData);
}

export function validateUpdateEntityPropertyValues(inputData: UpdateEntityPropertyValuesInputType): ValidationResult {
  return validateSchema(UpdateEntityPropertyValuesSchema, inputData);
}
