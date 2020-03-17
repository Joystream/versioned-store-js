import { Substrate } from "../cli/substrate";
import { prettyClass, prettyEntity } from '../cli/printers';
import { checkForDuplicateExistingClassNames } from "../cli/checks";
import { Credential } from '@joystream/types/lib/versioned-store/permissions/credentials';
import { bool, u32, Option, Vec } from '@polkadot/types';
import { OperationType} from '@joystream/types/lib/versioned-store/permissions/batching/operation-types';
import { Operation } from '@joystream/types/lib/versioned-store/permissions/batching/';
import ClassId from '@joystream/types/lib/versioned-store/ClassId';
import { ParametrizedEntity } from '@joystream/types/lib/versioned-store/permissions/batching/parametrized-entity';
import { ParametrizedPropertyValue } from '@joystream/types/lib/versioned-store/permissions/batching/parametrized-property-value';
import ParametrizedClassPropertyValue from '@joystream/types/lib/versioned-store/permissions/batching/ParametrizedClassPropertyValue';
import { transformPropertyValueToEnum } from '../transformPropertyValueToEnumValue'
import { transformAddSchemaSupportToEntity } from '../transformAddSchemaSupportToEntity'
import { PropertyByNameMap, AddSchemaSupportToEntityInputType, AddSchemaSupportToEntityOutputType } from '../types';
import { PropertyValueEnumValue } from '@joystream/types/lib/versioned-store/PropertyValue';

import entityJsons = require('../inputs/entity-values/add-schema-support-json-schemas/index.js');

import {
  CURRENT_LEAD_CREDENTIAL
} from './credentials';
import { KeypairType } from '@polkadot/util-crypto/types';


const classNamesInput = process.argv[2] as string
console.log(classNamesInput)
const schemaIdsInput = process.argv[3] as string
console.log(schemaIdsInput)

const classNameArray:string[] = classNamesInput.split(',')
console.log(classNameArray)

const schemaIdsArray:number[] = []
schemaIdsInput.split(',').forEach((value:string) => {
  schemaIdsArray.push(Number(value))
  })
console.log(schemaIdsArray)

const entitityInput:AddSchemaSupportToEntityInputType[][] = []

if (classNameArray.length != schemaIdsArray.length) {
  throw new Error(`Input contains ${classNameArray.length} classes and ${schemaIdsArray.length}`)
} else {
  for (let i=0; i<classNameArray.length; i++) {
    let entitityInputClass:AddSchemaSupportToEntityInputType[] = []
    for (let n=0; n<entityJsons.default.length; n++ ) {
      const index = entityJsons.default[n].classId.indexOf(classNameArray[i])
      if (index != -1) {
        for (let m=0; m<entityJsons.default[n].entities.length; m++) {
          entityJsons.default[n].entities[m].schemaId = schemaIdsArray[i]
        }
        entitityInputClass = entityJsons.default[n].entities
      }
    }
    entitityInput.push(entitityInputClass)
  }
}

//TODO verify process.argv

// async function
async function main() {
  const LEAD_SEED_URI = process.env['LEAD_SEED_URI'];
  const LEAD_KEY_TYPE = process.env['LEAD_KEY_TYPE'] as KeypairType;

  const sub = new Substrate();
  await sub.connect();
  sub.setKeypair({
    uri: LEAD_SEED_URI || '//Alice',
    type: LEAD_KEY_TYPE || 'sr25519'
  })

  const classMap = await checkForDuplicateExistingClassNames(sub)
  console.log('classes',classMap)
  const classNameToIdMap = await sub.classNameToIdMap()

  const classIds = []
  //const classSchemaPropertyMaps: PropertyByNameMap[] = []
  const classPropertyMaps: PropertyByNameMap[] = []
  for (let i=0; i<classNameArray.length; i++) {
    if (classNameToIdMap.has(classNameArray[i])) {
      const classIdNumber = classNameToIdMap.get(classNameArray[i])
      classIds.push(classIdNumber)
      classPropertyMaps.push(await sub.getClassPropertyMap(new ClassId(classIdNumber)))
      //classSchemaPropertyMaps.push(await sub.getClassSchemaPropertyMap(new ClassId(classIdNumber),schemaIdsArray[i]))
    }
  }

  const enumsClassArray:PropertyValueEnumValue[][][] = []
  const transformedAddSchemaSupportByClassArray:AddSchemaSupportToEntityOutputType[][] = []
  for (let i=0; i<entitityInput.length; i++) {
    const transformedAddSchemaSupportArray:AddSchemaSupportToEntityOutputType[] = []
    const enumsArray:PropertyValueEnumValue[][] = []
    for (let n=0; n<entitityInput[i].length; n++ ) {
      const schema_with_values = entitityInput[i][n]
      const entityEnum: PropertyValueEnumValue[] = []
      schema_with_values.propertyValues
      const transformedAddSchemaSupport = transformAddSchemaSupportToEntity(schema_with_values,classPropertyMaps[i])
      //const transformedAddSchemaSupport = transformAddSchemaSupportToEntity(schema_with_values,classSchemaPropertyMaps[i])
      if (!transformedAddSchemaSupport.error) {
        transformedAddSchemaSupportArray.push(transformedAddSchemaSupport.result)
        for (let m=0; m<entitityInput[i][n].propertyValues.length; m++ ) {
          const propType = (classPropertyMaps[i].get(entitityInput[i][n].propertyValues[m].name)).type
          //const propType = (classSchemaPropertyMaps[i].get(entitityInput[i][n].propertyValues[m].name)).type
          //console.log("propType",propType)
          const value = entitityInput[i][n].propertyValues[m].value
          //console.log("value",value)
          const propertyValueEnum:PropertyValueEnumValue = transformPropertyValueToEnum(propType,value)
          //console.log(propertyValueEnum)
          entityEnum.push(propertyValueEnum)
        }
      }
      enumsArray.push(entityEnum)
    }
    enumsClassArray.push(enumsArray)
    transformedAddSchemaSupportByClassArray.push(transformedAddSchemaSupportArray)
  }

  // Batch Operations to execute in order..
  let batch: Vec<Operation> = new Vec(Operation);

    // First operation(s) - index 0 - entitityInput.length
  for (let i=0; i<transformedAddSchemaSupportByClassArray.length; i++) {
    for (let n=0; n<transformedAddSchemaSupportByClassArray[i].length; n++) {
      batch.push(new Operation({
        with_credential: new Option(Credential, CURRENT_LEAD_CREDENTIAL),
        as_entity_maintainer: new bool(true),
        operation_type: OperationType.CreateEntity(new ClassId(classIds[i]))
      }));
    }
  }

  let addSchemaToEntityCounter = 0

  for (let i=0; i<transformedAddSchemaSupportByClassArray.length; i++) {
    for (let n=0; n<transformedAddSchemaSupportByClassArray[i].length; n++) {
      const parametrizedPropertyValues:ParametrizedClassPropertyValue[] = []
      for (let m=0; m<transformedAddSchemaSupportByClassArray[i][n].property_values.length; m++) {
        parametrizedPropertyValues.push(new ParametrizedClassPropertyValue({
          in_class_index: transformedAddSchemaSupportByClassArray[i][n].property_values[m].in_class_index,
          value: ParametrizedPropertyValue.PropertyValue(enumsClassArray[i][n][m])
        }))
      }
      batch.push(new Operation({
        with_credential: new Option(Credential, CURRENT_LEAD_CREDENTIAL),
        as_entity_maintainer: new bool(true),
        operation_type: OperationType.AddSchemaSupportToEntity(
            ParametrizedEntity.InternalEntityJustAdded(new u32(addSchemaToEntityCounter)),
            transformedAddSchemaSupportByClassArray[i][n].schema_id,
            new Vec(ParametrizedClassPropertyValue, parametrizedPropertyValues)
            )
      }));
      addSchemaToEntityCounter++
    }
  }

    const entityIdBeforeBatch = await sub.nextEntityId() as unknown as number

    await sub.signTxAndSend(sub.vsTx.transaction(batch));

    const entityIdAfterBatch = await sub.nextEntityId() as unknown as number

    for (let i=0; i<classIds.length; i++) {
      const classId = classIds[i]
      const clazz = await sub.getClassById(classIds[i])
        .catch(err => console.log(`Failed to get class by id '${classId}'`, err));
      console.log(`Class by id`, classId, prettyClass(clazz))
    }

    console.log(`All new entity ids:`)

    for (let i=entityIdBeforeBatch; i<entityIdAfterBatch; i++) {
      const entity = await sub.getEntityById(i)
        .catch(err => console.log(`Failed to get entity by id '${i}'`, err));

      const entityAsText = await prettyEntity(entity, sub)
      console.log(`Entity by id`, Number(i), entityAsText)
    }


sub.disconnect();
}

main()
