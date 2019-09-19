import { u16 } from '@polkadot/types';
import EntityId from '../srml-types/versioned-store/EntityId';
import { VecClassPropertyValue } from '../srml-types/versioned-store';
import { PropertyNameAndValueInputType } from './PropertyTypes';
import { EntityIdInputType } from './EntityIdType';

export type AddSchemaSupportToEntityInputType = {
  entityId: EntityIdInputType,
  schemaId: number,
  propertyValues?: PropertyNameAndValueInputType[]
}

export type AddSchemaSupportToEntityOutputType = {
  entity_id: EntityId,
  schema_id: u16,
  property_values: VecClassPropertyValue
}
