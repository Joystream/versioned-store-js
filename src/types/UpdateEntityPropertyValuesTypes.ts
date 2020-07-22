import EntityId from '@joystream/types/versioned-store/EntityId';
import { VecClassPropertyValue } from '@joystream/types/versioned-store';
import { EntityIdInputType } from './EntityIdType';
import { PropertyNameAndValueInputType } from './PropertyTypes';

export type UpdateEntityPropertyValuesInputType = {
  entityId: EntityIdInputType
  newPropertyValues?: PropertyNameAndValueInputType[]
}

export type UpdateEntityPropertyValuesOutputType = {
  entity_id: EntityId,
  new_property_values: VecClassPropertyValue
}
