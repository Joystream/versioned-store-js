import { Substrate } from "../cli/substrate";
import { transformClassSchemaByNameToId } from "../cli/transform";
import { prettyClass } from '../cli/printers';
import { checkUniqueClassNamesFromJson } from "../cli/checks";
import { CreateClassInputType, AddClassSchemaInputByClassNameType, ClassSchemaInputByClassNameType } from '../types';
import ClassPermissions from '@joystream/types/lib/versioned-store/permissions/ClassPermissions';
import EntityPermissions from '@joystream/types/lib/versioned-store/permissions/EntityPermissions';
import { CredentialSet, Credential } from '@joystream/types/lib/versioned-store/permissions/credentials';
import { bool, u32, Option } from '@polkadot/types';
import { ReferenceConstraint } from '@joystream/types/lib/versioned-store/permissions/reference-constraint';
import { transformAddClassSchema } from '../transformAddClassSchema'
import ClassId from '@joystream/types/lib/versioned-store/ClassId';
import { validateCreateClass } from '../validate'

import {
  CURRENT_LEAD_CREDENTIAL, ANY_CURATOR_CREDENTIAL, ANY_CHANNEL_OWNER_CREDENTIAL
} from './credentials';

// take newClassInputType arg
function makeClassPermissions (newClass: CreateClassInputType) {
  let createEntitiesCredentials = [CURRENT_LEAD_CREDENTIAL, ANY_CURATOR_CREDENTIAL];

  if (newClass.channel_owners_can_create_entity) {
    createEntitiesCredentials.push(ANY_CHANNEL_OWNER_CREDENTIAL)
  }

  return new ClassPermissions({
    entity_permissions: new EntityPermissions({
      update: new CredentialSet([CURRENT_LEAD_CREDENTIAL, ANY_CURATOR_CREDENTIAL]),
      maintainer_has_all_permissions: new bool(true),
    }),
    entities_can_be_created: new bool(true),
    add_schemas: new CredentialSet([CURRENT_LEAD_CREDENTIAL]),
    create_entities: new CredentialSet(createEntitiesCredentials),
    reference_constraint: ReferenceConstraint.NoConstraint(),
    admins: new CredentialSet([CURRENT_LEAD_CREDENTIAL]),
    last_permissions_update: new u32(0), // BlockNumber
  });
}

const createClasses = process.argv[2] as string
const addSchemas = process.argv[3] as string


//import new class JSON(s)
import createClassJsons = require('../inputs/classes/index.js');

//import new schema JSON(s)
const addClassSchemaJsons:ClassSchemaInputByClassNameType = require('../inputs/schemas/index.js');
//const addClassSchemaJsons:ClassSchemaInputByClassNameType = require('../inputs/schema-tests/index.js');

const newClasses: CreateClassInputType[] = []

if (createClasses != "false") {
  for (let i=0; i<createClassJsons.default.length; i++) {
    const input:CreateClassInputType = createClassJsons.default[i]
    const validate = validateCreateClass(input)
    if (validate.valid === true ) {
      newClasses.push(input)
    } else {
      throw new Error(`${validate.errors}`)
    }
  }
} else {
  console.log("No new classes will be added.")
}

const newSchemas: AddClassSchemaInputByClassNameType[] = []
if (addSchemas != "false") {
  for (let i=0; i<addClassSchemaJsons.default.length; i++) {
    newSchemas.push(addClassSchemaJsons.default[i])
  }
} else {
  console.log("No new schemas will be added.")
}

// async function
async function main() {
  const sub = new Substrate();
  await sub.connect();
  sub.setKeypair({
    uri: '//Alice',
    type: 'sr25519'
  })


  // Validate unique classnames
  const classMap = await checkUniqueClassNamesFromJson(newClasses, sub)
  console.log("Existing Class map",classMap)

  const allClassIds:number[] = Array.from(classMap.keys())
  const allClassNames:string[] = Array.from(classMap.values())
  const newClassesAffected:number[] = []
  // Create classes drom imported JSON(s)
  for (let classItem in newClasses){
    const newClass = newClasses[classItem];
    const newClassCreatedEvent = await sub.txCreateClass(newClass, makeClassPermissions(newClass))
    newClassesAffected.push(newClassCreatedEvent)
    allClassIds.push(newClassCreatedEvent)
    allClassNames.push(newClasses[classItem].name)
  }
  // End dreate classe(s)

  const newClassMap = await sub.classIdToNameMap()
  console.log("New Class map",newClassMap)


  // Add new schemas to classes from imported JSON
  const transformedSchemas = await transformClassSchemaByNameToId(newSchemas,sub)

  for (let schemaItem in transformedSchemas){
    const schema = transformedSchemas[schemaItem]
    const propMap = await sub.getClassPropertyMap(new ClassId(schema.classId))
    const validate = transformAddClassSchema(schema,propMap);
    if (!validate.result) {
      console.log(`Validation of schema for classId: ${schema.classId} failed with:
       ${validate.error}`)
      throw new Error(`${validate.error}`)
    }
  }

  for (let schemaItem in transformedSchemas){
    const schema = transformedSchemas[schemaItem]
    const newClassSchemaAddedEvent = await sub.txAddClassSchema(schema, new Option(Credential, CURRENT_LEAD_CREDENTIAL))
    //newClassSchemasCreated.push([JSON.parse(`${newClassSchemaAddedEvent[0]}`),JSON.parse(`${newClassSchemaAddedEvent[1]}`)])
    if (newClassesAffected.indexOf(newClassSchemaAddedEvent[0]) == -1 ) {
      newClassesAffected.push(newClassSchemaAddedEvent[0])
    }
  }
  // End add schema to class(s)

  for (let item in newClassesAffected){
    const clazz = await sub.getClassById(newClassesAffected[item])
      .catch(err => console.log(`Failed to get class by id '${newClassesAffected[item]}'`, err));
    console.log(`Classes affected by id`, newClassesAffected[item], prettyClass(clazz))
  }
  sub.disconnect();
}

main()
