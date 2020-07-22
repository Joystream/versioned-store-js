import { Substrate } from "../cli/substrate";
import { arrayToOneLineString, prettyClass, prettyEntity } from '../cli/printers';
import { AddClassSchemaInputType } from '../types/AddClassSchemaTypes';
import ClassPermissions from '@joystream/types/versioned-store/permissions/ClassPermissions';
import EntityPermissions from '@joystream/types/versioned-store/permissions/EntityPermissions';
import { CredentialSet, Credential } from '@joystream/types/common';
import { bool, u64, u32, u16, Option, Vec } from '@polkadot/types';
import { ReferenceConstraint } from '@joystream/types/versioned-store/permissions/reference-constraint';
import { OperationType} from '@joystream/types/versioned-store/permissions/batching/operation-types';
import { Operation } from '@joystream/types/versioned-store/permissions/batching/';
import ClassId from '@joystream/types/versioned-store/ClassId';
import { ParametrizedEntity } from '@joystream/types/versioned-store/permissions/batching/parametrized-entity';
import { ParametrizedPropertyValue } from '@joystream/types/versioned-store/permissions/batching/parametrized-property-value';
import { Text as TextValue, TextVec as TextVecValue } from '@joystream/types/versioned-store/PropertyValue';
import ParametrizedClassPropertyValue from '@joystream/types/versioned-store/permissions/batching/ParametrizedClassPropertyValue';

const CURRENT_LEAD_CREDENTIAL = new u64(0);

const CLASS_PERMISSIONS = new ClassPermissions({
  entity_permissions: new EntityPermissions({
    update: new CredentialSet([CURRENT_LEAD_CREDENTIAL]),
    maintainer_has_all_permissions: new bool(true),
  }),
  entities_can_be_created: new bool(true),
  add_schemas: new CredentialSet([CURRENT_LEAD_CREDENTIAL]),
  create_entities: new CredentialSet([CURRENT_LEAD_CREDENTIAL]),
  reference_constraint: ReferenceConstraint.NoConstraint(),
  admins: new CredentialSet([]),
  last_permissions_update: new u32(0), // BlockNumber
});

// tslint:disable-next-line:max-func-body-length
async function main() {
  const sub = new Substrate();
  await sub.connect();
  sub.setKeypair({
    uri: '//Alice',
    type: 'sr25519'
  })

  // const ALICE = sub.keypair.address;

  // Create class
  // ------------------------------------------

  const newClass = {
    name: 'Podcast',
    description: 'Desc of podcast class'
  }

  const classId = await sub.txCreateClass(newClass, CLASS_PERMISSIONS)

  // Get all class ids
  // ------------------------------------------

  const allClassIds = await sub.getAllClassIds()
    .catch(err => console.log('Failed to get list of class ids from Substrate.', err));

  console.log(`All class ids:`)
  console.log(arrayToOneLineString(allClassIds))

  // Add new schema to class
  // ------------------------------------------

  const newClassSchema: AddClassSchemaInputType = {
    classId,
    newProperties: [
      // {
      //   required: true,
      //   type: 'Uint16',
      //   name: 'episode',
      //   description: 'A episode nubmer in this podcast'
      // },
      {
        required: true,
        type: 'Text',
        name: 'author',
        description: 'Author of this podcast episode',
        maxTextLength: 51
      },
      {
        required: false,
        type: 'TextVec',
        name: 'guests',
        description: 'Guests in this podcast episode',
        maxItems: 11,
        maxTextLength: 61
      }
    ]
  };

  const addClassSchema = await sub.txAddClassSchema(newClassSchema, new Option(Credential, CURRENT_LEAD_CREDENTIAL))

  const schemaId = addClassSchema[1]

  // Create new entity
  // ------------------------------------------

  const newEntity = { classId }
  const entityId = await sub.txCreateEntity(newEntity, new Option(Credential, CURRENT_LEAD_CREDENTIAL))

  // Add schema support to entity
  // ------------------------------------------

  const schema_with_values = {
    entityId,
    schemaId,
    propertyValues: [
      // {
      //   name: 'episode',
      //   value: 123
      // },
      {
        name: 'author',
        value: 'Alice'
      },
      {
        name: 'guests',
        value: [
          'Bob',
          'Charlie'
        ]
      }
    ]
  }

  await sub.txAddSchemaSupportToEntity(schema_with_values, new Option(Credential, CURRENT_LEAD_CREDENTIAL), true)

  const new_property_values ={
    entityId,
    newPropertyValues: [
      {
        name: 'author',
        value: 'Dave'
      },
      {
        name: 'guests',
        value: [
          'Eve',
          'Freddie'
        ]
      }
    ]
  }

  await sub.txUpdateEntityPropertyValues(new_property_values, new Option(Credential, CURRENT_LEAD_CREDENTIAL), true)

  // Get Class
  // ------------------------------------------

  const clazz = await sub.getClassById(classId)
    .catch(err => console.log(`Failed to get class by id '${classId}'`, err));

  console.log(`Class by id`, classId, prettyClass(clazz))

  // Get all entity ids
  // ------------------------------------------

  const allEntityIds = await sub.getAllEntityIds()
    .catch(err => console.log('Failed to get list of all entity ids from Substrate.', err));

  console.log(`All entity ids:`)
  console.log(arrayToOneLineString(allEntityIds))

  // Get Entity
  // ------------------------------------------

  const entity = await sub.getEntityById(classId)
    .catch(err => console.log(`Failed to get entity by id '${entityId}'`, err));

  const entityAsText = await prettyEntity(entity, sub)
  console.log(`Entity by id`, entityId, entityAsText)

  // Update the class permissions with sudo call
  await sub.makeSudoCall(
    sub.vsTx.setClassAdmins(classId, new CredentialSet([CURRENT_LEAD_CREDENTIAL]))
  );

  // linked_map so return value is a Tuple(ClassPermissions, Linkage)
  // Linkage provides: previous and next of type Option<ClassId> to provide iteration
  const classPermissionsTuple = await sub.vsPermissionsQuery.classPermissionsByClassId(classId) as ClassPermissions;
  // console.log(classPermissionsTuple[0]);
  console.log('admins:', classPermissionsTuple[0].admins);

  /// Create entities using batching operations

  // Batch Operations to execute in order..
  let batch: Vec<Operation> = new Vec(Operation, /*[op1, op2, ...]*/);

  // First operation - index 0
  batch.push(new Operation({
    with_credential: new Option(Credential, CURRENT_LEAD_CREDENTIAL),
    as_entity_maintainer: new bool(true),
    operation_type: OperationType.CreateEntity(new ClassId(classId))
  }));

  // Second operation - index 1
  batch.push(new Operation({
    with_credential: new Option(Credential, CURRENT_LEAD_CREDENTIAL),
    as_entity_maintainer: new bool(true),
    operation_type: OperationType.AddSchemaSupportToEntity(
      // entity created in first operation (index 0)
      ParametrizedEntity.InternalEntityJustAdded(new u32(0)),
      new u16(0), // schema 0
      new Vec(ParametrizedClassPropertyValue, [
        // property 0
        new ParametrizedClassPropertyValue({
          in_class_index: new u16(0),
          value: ParametrizedPropertyValue.PropertyValue({'Text': new TextValue('Dave')})
        }),
        // property 1
        new ParametrizedClassPropertyValue({
          in_class_index: new u16(1),
          value: ParametrizedPropertyValue.PropertyValue({'TextVec': new TextVecValue(['Eve', 'Freddie'])})
        })
      ])
    )
  }));

  // execute the batch - since all the opeartions are executed with one account
  // that account must have permissions for all operations.
  await sub.signTxAndSend(sub.vsTx.transaction(batch));

  sub.disconnect();
}

main()
