import { Substrate } from './substrate';

import {
  stringToArray, stringToText, convertFromCamelCase
} from './utils';

import { arrayToMultiLineString } from './printers';
import {
  validateCreateClass, validateAddClassSchema, validateCreateEntity,
  validateAddSchemaSupportToEntity, validateUpdateEntityPropertyValues
} from '../validate';

import {
  getPropertyInClassMap as PropertyInClassMap,
  getPropertyInClassSchemaMap as PropertyInClassSchemaMap,
  getRequiredPropertyInClassMap as RequiredPropertyInClassMap,
  getRequiredPropertyInClassSchemaMap as RequiredPropertyInClassSchemaMap,
  getClassIdToNameMap as ClassIdToNameMap,
  getClassNameToIdMap as ClassNameToIdMap,
  getClassIdToNameAndSchemasMap as ClassIdToNameAndSchemasMap,
  getEntityByItsId as EntityByItsId,
  getEntityIdNumberInClass as EntityIdNumberInClass,
  getTotalEntitiesClass as TotalEntitiesClass
} from './gets';

import {
  checkForDuplicateExistingClassNames as ForDuplicateExistingClassNames,
  checkUniqueClassNamesFromList as ForUniqueClassName
} from './checks'

import {
  createClassJson as ClassJson,
  createClassSchemaJsonFromClassName as ClassSchemaJsonFromClassName
} from './create'

import {
  generateEntityJsonSchemaFromList as EntityJsonSchemaFromList
} from './transform'

import {
  addSchemaSupportToEntity as AddSchemaSupportToEntity
} from './update-entities'

import {
  createClassQuestions as ClassQ
  /*,
  createSchemaQ1 as SchemaQ1,
  createSchemaQ2 as SchemaQ2,
  createSchemaQ3 as SchemaQ3,
  createSchemaQ4 as SchemaQ4
  */
} from './questions'
/*
import {
  transformClassSchemaByNameToId as ClassSchemaByNameToId
 } from './transform'
*/
import { bool, u32, Option } from '@polkadot/types';
import { CredentialSet, Credential } from '@joystream/types/lib/versioned-store/permissions/credentials';
import ClassPermissions from '@joystream/types/lib/versioned-store/permissions/ClassPermissions';
import EntityPermissions from '@joystream/types/lib/versioned-store/permissions/EntityPermissions';
import { ReferenceConstraint, NoConstraint } from '@joystream/types/lib/versioned-store/permissions/reference-constraint';

import { CreateClassInputType
  /*,
  PropertyName, PropertyInputType, PropertyInputByClassNameType, PropertyByNameMap,
  AddClassSchemaInputType, AddClassSchemaInputByClassNameType
  */
 } from '../types'

import * as inquirer from 'inquirer'
const program = require('commander');
//import * as test from 'commander'
//const getRemainingArgs = require('commander-remaining-args');
//import * as test from 'commander-remaining-args'
//const entitityValueLists:PropertyValueInputType[][] = require('../inputs/entity-values/lists/index')


const opt_showCommands = `showCommands`
const sub = new Substrate();

const CREDENTIAL_ONE = new u32(1);

const CLASS_PERMISSIONS = new ClassPermissions({
  entity_permissions: new EntityPermissions({
    update: new CredentialSet([CREDENTIAL_ONE]),
    maintainer_has_all_permissions: new bool(true),
  }),
  entities_can_be_created: new bool(true),
  add_schemas: new CredentialSet([CREDENTIAL_ONE]),
  create_entities: new CredentialSet([CREDENTIAL_ONE]),
  reference_constraint: new ReferenceConstraint({'NoConstraint': new NoConstraint()}),
  admins: new CredentialSet([]),
  last_permissions_update: new u32(0), // BlockNumber
});


// TODO read this:
// https://github.com/tj/commander.js/#commands

program
  .version('0.1.0')
  .description('CLI for Substrate versioned store')
  .option(`-a, --${opt_showCommands}`, `Show available commands`)

program
  .command(`get <cmd>`)
  .description(`get class and schema data from chain`)
  .arguments(`
    [classId] as int >= 1.
    [schemaId] as int>=0.
    [entityId] as int >= 1.
  `)
  .action( async (cmd:string, arg1:string, arg2?:string) => {
    await sub.connect()
    if (cmd == "PropertyInClassMap") {
      const classId = myParseInt(arg1)
      const res = await PropertyInClassMap(classId,sub)
      sub.disconnect();
      console.log(res)
      return res
    } else if (cmd == "PropertyInClassSchemaMap") {
      const classId = myParseInt(arg1)
      const schemaId = myParseInt(arg2)
      console.log("schemaId",schemaId)
      const res = await PropertyInClassSchemaMap(classId,schemaId,sub)
      sub.disconnect();
      console.log(res)
      return res
    } else if (cmd == "RequiredPropertyInClassMap") {
      const classId = myParseInt(arg1)
      const res = await RequiredPropertyInClassMap(classId,sub)
      sub.disconnect();
      console.log(res)
      return res
    } else if (cmd == "RequiredPropertyInClassSchemaMap") {
      const classId = myParseInt(arg1)
      const schemaId = myParseInt(arg2)
      const res = await RequiredPropertyInClassSchemaMap(classId,schemaId,sub)
      sub.disconnect();
      console.log(res)
      return res
    } else if (cmd == "ClassIdToNameMap") {
      const res = await ClassIdToNameMap(sub)
      sub.disconnect();
      console.log(res)
      return res
    } else if (cmd == "ClassNameToIdMap") {
      const res = await ClassNameToIdMap(sub)
      sub.disconnect();
      console.log(res)
      return res
    } else if (cmd == "ClassIdToNameAndSchemasMap") {
      const res = await ClassIdToNameAndSchemasMap(sub)
      sub.disconnect();
      console.log(res)
      return res
    } else if (cmd == "EntityByItsId") {
      const entityId = myParseInt(arg1)
      const res = await EntityByItsId(entityId,sub)
      sub.disconnect();
      console.log(res)
      return res
    } else if (cmd == "EntityIdNumberInClass") {
      const classId = myParseInt(arg1)
      const res = await EntityIdNumberInClass(classId,sub)
      sub.disconnect();
      console.log(arrayToMultiLineString(res))
      return res
    } else if (cmd == "TotalEntitiesClass") {
      const classId = myParseInt(arg1)
      const res = await TotalEntitiesClass(classId,sub)
      sub.disconnect();
      console.log(res)
      return res
    } else {
      return "error"
    }
  }).on(`--help`,() => {
    console.log()
    console.log(`available <cmd>:`)
    console.log(`   PropertyInClassMap <classId>
                      <classId> as int >= 1.`)
    console.log()
    console.log(`   PropertyInClassSchemaMap <classId> <schemaId>
                      <classId> as int >= 1.
                      <schemaId> as int >= 1.`)
    console.log()
    console.log(`   RequiredPropertyInClassMap <classId>
                      <classId> as int >= 1.`)
    console.log()
    console.log(`   RequiredPropertyInClassSchemaMap <classId> <schemaId>
                      <classId> as int >= 1.
                      <schemaId> as int >= 1.`)
    console.log()
    console.log(`   ClassIdToNameMap`)
    console.log()
    console.log(`   ClassNameToIdMap`)
    console.log()
    console.log(`   ClassIdToNameAndSchemasMap`)
    console.log()
    console.log(`   EntityByItsId <entityId>
                      <entityId> as int >= 1.`)
    console.log()
    console.log(`   EntityIdNumberInClass <classId>
                      <classId> as int >= 1.`)
    console.log()
    console.log(`   TotalEntitiesClass <classId>
                      <classId> as int >= 1.`)
    console.log()
    exit()
});

program
  .command(`check <cmd>`)
  .description(`check classes and schemas`)
  .arguments(`
    [className] as comma separated class names (in camelCase).
  `)
  .action( async (cmd:string, arg1?:string) => {
    await sub.connect()
    if (cmd == "ForDuplicateExistingClassNames") {
      const res = await ForDuplicateExistingClassNames(sub)
      sub.disconnect();
      console.log(res)
      return res
    } else if (cmd == "ForUniqueClassName") {
      const classListInput:string = arg1
      const classListArray:string[] = stringToArray(classListInput)
      const classList:string[] = []
      for (let i=0; i<classListArray.length; i++) {
        classList.push(convertFromCamelCase(classListArray[i]))
      }
      console.log("classList",classList)
      const res = await ForUniqueClassName(classList,sub)
      sub.disconnect();
      console.log(res)
      return res
    } else {
      return "error"
    }
  }).on(`--help`,() => {
    console.log()
    console.log(`available <cmd>:`)
    console.log(`   ForDuplicateExistingClassNames`)
    console.log()
    console.log(`   ForUniqueClassName <classIds>
                      <classId> as int >= 1.`)
    console.log()
    exit()
});

program
  .command(`create <cmd>`)
  .description(`create classes, schemas and entities`)
  .arguments(`
    [broadcast] to broadcast if all checks passes.
    `)
  .action( async (cmd:string, arg1?:string) => {
    await sub.connect();
    sub.setKeypair({
      uri: '//Alice',
      type: 'sr25519'
    })
    if (cmd == "Class") {
      const newClass = await inquirer.prompt(ClassQ)
      .then( async (answers:CreateClassInputType) => await ClassJson(answers.name,answers.description,sub))
      if (arg1 == "broadcast") {
        await sub.txCreateClass(newClass, CLASS_PERMISSIONS)
        sub.disconnect();
        return newClass
      } else {
        sub.disconnect();
        return newClass
      }
    } else {
      return "error"
    }
  }).on(`--help`,() => {
    console.log()
    console.log(`available <cmd>:`)
    console.log(`   Class [broadcast]
                      [broadcast] to broadcast if all checks passes.`)
    console.log()
    exit()
});

program
  .command(`generate <cmd>`)
  .description(`generate classes, schemas and entities.`)
  .arguments(`
    <className> name of class (in camelCase).
    [classDescription] description of class with % as space.
    [schemaId] as int>=0.
    [propertyNames] as comma separated property names (in camelCase).
  `)
  .action( async (cmd:string, arg1:string, arg2?:string, arg3?:string) => {
    if (cmd == "Class") {
      await sub.connect();
      sub.setKeypair({
        uri: '//Alice',
        type: 'sr25519'
      })
      const className = convertFromCamelCase(arg1)
      const classDescription = stringToText(arg2)
      const newClass = await ClassJson(className,classDescription,sub)
      sub.disconnect();
      return newClass
    } else if (cmd == "EntityJsonFromList") {
      const className = convertFromCamelCase(arg1)
      console.log("className",className)
      const schemaId = myParseInt(arg2)
      console.log("schemaId",schemaId)
      const propertyNamesInput:string = arg3
      const propertyNamesArray:string[] = stringToArray(propertyNamesInput)
      const propertyNames:string[] = []
      for (let i=0; i<propertyNamesArray.length; i++) {
        propertyNames.push(convertFromCamelCase(propertyNamesArray[i]))
      }
      console.log("propertyNamesArray",propertyNamesArray)
      const entityJson = await EntityJsonSchemaFromList(className,schemaId,propertyNames)
      console.log(JSON.stringify(entityJson,null,1))
      return entityJson
    } else {
      return "error"
    }
  }).on(`--help`,() => {
    console.log()
    console.log(`available <cmd>:`)
    console.log(`   Class <className> <classDescription>;
                      <className> name of class (in camelCase).
                      <classDescription> description of class (in camelCase).`)
    console.log()
    console.log(`   EntityJsonFromList <className> <schemaId> <propertyNames>
                      <className> name of class (in camelCase).
                      <schemaId> as int>=0.
                      <propertyNames> as comma separated property names (in camelCase).`)
    console.log()
    exit()
});

program
  .command(`update <cmd>`)
  .description(`update entities`)
  .arguments(`
    [entityId] as int >= 1.
    [schemaId] as int>=0.
  `)
  .action( async (cmd:string, arg1?:string, arg2?:string) => {
    await sub.connect();
    sub.setKeypair({
      uri: '//Alice',
      type: 'sr25519'
    })
    if (cmd == "AddSchemaSupportToEntity") {
      const entityId = myParseInt(arg1)
      const schemaId = myParseInt(arg2)
      const getSchema = await AddSchemaSupportToEntity(entityId,schemaId)
      await sub.txAddSchemaSupportToEntity(getSchema, new Option(Credential, CREDENTIAL_ONE), true)
      sub.disconnect();
      return getSchema
    } else {
      return "error"
    }
}).on(`--help`,() => {
  console.log()
  console.log(`available <cmd>:`)
  console.log(`   AddSchemaSupportToEntity
                    <entityId> as int >= 1.
                    <schemaId> as int>=0.`)
  console.log()
  exit()
});

program.parse(process.argv)

function myParseInt(value) {
  return parseInt(value);
}

const ValidationFunctions = {
  validateCreateClass,
  validateAddClassSchema,
  validateCreateEntity,
  validateAddSchemaSupportToEntity,
  validateUpdateEntityPropertyValues
}
const GetInfoFromChain = {
  PropertyInClassMap,
  PropertyInClassSchemaMap,
  RequiredPropertyInClassMap,
  RequiredPropertyInClassSchemaMap,
  ClassIdToNameMap,
  ClassNameToIdMap,
  ClassIdToNameAndSchemasMap,
  EntityByItsId,
  EntityIdNumberInClass,
  TotalEntitiesClass
}

const CheckClassesAndSchemas = {
  ForDuplicateExistingClassNames,
  ForUniqueClassName
}
const CreateJsonSchemas = {
  ClassJson,
  ClassSchemaJsonFromClassName
}

const GenerateJsonSchemas = {
  ClassJson,
  EntityJsonSchemaFromList
}

const UpdateEntities = {
  ClassJson,
  ClassSchemaJsonFromClassName
}

const ValidationFunctionNames = Object.keys(ValidationFunctions)
const GetNames = Object.keys(GetInfoFromChain)
const CheckNames = Object.keys(CheckClassesAndSchemas)
const CreateNames = Object.keys(CreateJsonSchemas)
const GenerateNames = Object.keys(GenerateJsonSchemas)
const UpdateNames = Object.keys(UpdateEntities)


function exit () {
  process.exit(0)
}

if (program[opt_showCommands]) {
  console.log(`Validation commands:`)
  console.log(arrayToMultiLineString(ValidationFunctionNames))
  console.log(`Get commands:`)
  console.log(arrayToMultiLineString(GetNames))
  console.log(`Check commands:`)
  console.log(arrayToMultiLineString(CheckNames))
  console.log(`Create commands:`)
  console.log(arrayToMultiLineString(CreateNames))
  console.log(`Generate commands:`)
  console.log(arrayToMultiLineString(GenerateNames))
  console.log(`Update entity commands:`)
  console.log(arrayToMultiLineString(UpdateNames))
  console.log()
  exit()
}
