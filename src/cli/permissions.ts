
import ClassPermissions from '@joystream/types/versioned-store/permissions/ClassPermissions';
import EntityPermissions from '@joystream/types/versioned-store/permissions/EntityPermissions';
import { CredentialSet } from '@joystream/types/common';
import { bool, u32 } from '@polkadot/types';
import { ReferenceConstraint, /* NoConstraint */ } from '@joystream/types/versioned-store/permissions/reference-constraint';

const CREDENTIAL_ONE = new u32(1);

export const CLASS_PERMISSIONS = new ClassPermissions({
  entity_permissions: new EntityPermissions({
    update: new CredentialSet([CREDENTIAL_ONE]),
    maintainer_has_all_permissions: new bool(true),
  }),
  entities_can_be_created: new bool(true),
  add_schemas: new CredentialSet([CREDENTIAL_ONE]),
  create_entities: new CredentialSet([CREDENTIAL_ONE]),
  reference_constraint: ReferenceConstraint.NoConstraint(), //({'NoConstraint': new NoConstraint()}),
  admins: new CredentialSet([]),
  last_permissions_update: new u32(0), // BlockNumber
});