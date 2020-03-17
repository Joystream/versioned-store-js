import { Text } from '@polkadot/types';

export type CreateClassInputType = {
  name: string,
  description: string,
  add_schema_restricted_to_lead?: boolean,
  create_entity_restricted_to_lead?: boolean,
}

export type CreateClassOutputType = {
  name: Text,
  description: Text
}
