import { u16 } from '@polkadot/types';
import EntityId from '@joystream/types/lib/versioned-store/EntityId';
import { VecClassPropertyValue } from '@joystream/types/lib/versioned-store';
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
