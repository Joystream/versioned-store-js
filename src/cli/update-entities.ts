// import { Substrate } from './substrate';
import { EntityIdInputType, AddSchemaSupportToEntityInputType } from '../types'

export async function addSchemaSupportToEntity(entityId:EntityIdInputType, schemaId:number, /*sub?: Substrate*/): Promise<AddSchemaSupportToEntityInputType> {
  const schema_with_values: AddSchemaSupportToEntityInputType = {
    entityId,
    schemaId
  }
  return schema_with_values
}
