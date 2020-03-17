import { Substrate } from "../cli/substrate";
import { prettyEntity } from '../cli/printers';
import { checkForDuplicateExistingClassNames } from "../cli/checks";
import { Credential } from '@joystream/types/lib/versioned-store/permissions/credentials';
import { bool, Option, Vec } from '@polkadot/types';
import { OperationType} from '@joystream/types/lib/versioned-store/permissions/batching/operation-types';
import { Operation } from '@joystream/types/lib/versioned-store/permissions/batching/';
import ClassId from '@joystream/types/lib/versioned-store/ClassId';
import { ParametrizedEntity } from '@joystream/types/lib/versioned-store/permissions/batching/parametrized-entity';
import { ParametrizedPropertyValue } from '@joystream/types/lib/versioned-store/permissions/batching/parametrized-property-value';
import ParametrizedClassPropertyValue from '@joystream/types/lib/versioned-store/permissions/batching/ParametrizedClassPropertyValue';
import { transformPropertyValueToEnum } from '../transformPropertyValueToEnumValue'
import { transformAddSchemaSupportToEntity } from '../transformAddSchemaSupportToEntity'
import { PropertyByNameMap, AddSchemaSupportToEntityInputType, AddSchemaSupportToEntityOutputType, PropertyValueInputType } from '../types';
import { PropertyValueEnumValue } from '@joystream/types/lib/versioned-store/PropertyValue';

import entityJsons = require('../inputs/entity-values/add-new-schema-support-json-schemas/index.js');
import EntityId from '@joystream/types/lib/versioned-store/EntityId';
import PropertyTypeName from '@joystream/types/lib/versioned-store/PropertyTypeName';

import {
  CURRENT_LEAD_CREDENTIAL
} from './credentials';


const classNamesInput = process.argv[2] as string
console.log(classNamesInput)

const classNameArray:string[] = classNamesInput.split(',')
console.log(classNameArray)

const entitityInput:AddSchemaSupportToEntityInputType[][] = []
const entityIdsAsNumbers:number[] = []
for (let i=0; i<classNameArray.length; i++) {
  let entitityInputClass:AddSchemaSupportToEntityInputType[] = []
  for (let n=0; n<entityJsons.default.length; n++ ) {
    const index = entityJsons.default[n].classId.indexOf(classNameArray[i])
    if (index != -1) {
      for (let m=0; m<entityJsons.default[n].entities.length; m++) {
        entityIdsAsNumbers.push(entityJsons.default[n].entities[m].entityId)
      }
      entitityInputClass = entityJsons.default[n].entities
    }
  }
  entitityInput.push(entitityInputClass)
}


//TODO verify process.argv

// async function
async function main() {
  const sub = new Substrate();
  await sub.connect();
  sub.setKeypair({
    uri: '//Alice',
    type: 'sr25519'
  })

  const classMap = await checkForDuplicateExistingClassNames(sub)
  console.log('classes',classMap)
  const classNameToIdMap = await sub.classNameToIdMap()

  const classIds = []
  const classPropertyMaps: PropertyByNameMap[] = []
  for (let i=0; i<classNameArray.length; i++) {
    if (classNameToIdMap.has(classNameArray[i])) {
      const classIdNumber = classNameToIdMap.get(classNameArray[i])
      classIds.push(classIdNumber)
      classPropertyMaps.push(await sub.getClassPropertyMap(new ClassId(classIdNumber)))
    }
  }
  console.log("classPropertyMaps",classPropertyMaps)


  const enumsClassArray:PropertyValueEnumValue[][][] = []
  const entityIdsInClassArray:EntityId[][] = []
  const transformedAddSchemaSupportByClassArray:AddSchemaSupportToEntityOutputType[][] = []
  for (let i=0; i<entitityInput.length; i++) {
    const transformedAddSchemaSupportArray:AddSchemaSupportToEntityOutputType[] = []
    const entityIdsArray:EntityId[] = []
    const enumsArray:PropertyValueEnumValue[][] = []
    for (let n=0; n<entitityInput[i].length; n++ ) {
      const schema_with_values = entitityInput[i][n]
      const entityEnum: PropertyValueEnumValue[] = []
      const transformedAddSchemaSupport = transformAddSchemaSupportToEntity(schema_with_values,classPropertyMaps[i])
      if (!transformedAddSchemaSupport.error) {
        transformedAddSchemaSupportArray.push(transformedAddSchemaSupport.result)
        if (entitityInput[i][n].propertyValues) {
          for (let m=0; m<entitityInput[i][n].propertyValues.length; m++ ) {
            //const classSchemaPropertyMaps:PropertyByNameMap = await sub.getClassSchemaPropertyMap(new ClassId(classIdNumber),schemaIdsArray[i]))
            const propType = (classPropertyMaps[i].get(entitityInput[i][n].propertyValues[m].name)).type
            const value = entitityInput[i][n].propertyValues[m].value
            const propertyValueEnum:PropertyValueEnumValue = transformPropertyValueToEnum(propType,value)
            entityEnum.push(propertyValueEnum)
          }
        } else {
          const propType:PropertyTypeName = 'None'
            const value:PropertyValueInputType = null
            const propertyValueEnum:PropertyValueEnumValue = transformPropertyValueToEnum(propType,value)
            entityEnum.push(propertyValueEnum)
        }
      }
      enumsArray.push(entityEnum)
      entityIdsArray.push(new EntityId(schema_with_values.entityId))
    }
    enumsClassArray.push(enumsArray)
    entityIdsInClassArray.push(entityIdsArray)
    transformedAddSchemaSupportByClassArray.push(transformedAddSchemaSupportArray)
  }

  // Batch Operations to execute in order..
  let batch: Vec<Operation> = new Vec(Operation);

    // First operation(s) - index 0 - entitityInput.length

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
            ParametrizedEntity.ExistingEntity(new EntityId(entityIdsInClassArray[i][n])),
            transformedAddSchemaSupportByClassArray[i][n].schema_id,
            new Vec(ParametrizedClassPropertyValue, parametrizedPropertyValues)
            )
      }));
    }
  }
  console.log(`Entities before updates:`)

  for (let i=0; i<entityIdsAsNumbers.length; i++) {
    const entity = await sub.getEntityById(entityIdsAsNumbers[i])
      .catch(err => console.log(`Failed to get entity by id '${entityIdsAsNumbers[i]}'`, err));

    const entityAsText = await prettyEntity(entity, sub)
    console.log(`Entity by id`, entityIdsAsNumbers[i], entityAsText)
  }

  await sub.signTxAndSend(sub.vsTx.transaction(batch));

  console.log(`All updated entitys:`)

  for (let i=0; i<entityIdsAsNumbers.length; i++) {
    const entity = await sub.getEntityById(entityIdsAsNumbers[i])
      .catch(err => console.log(`Failed to get entity by id '${entityIdsAsNumbers[i]}'`, err));

    const entityAsText = await prettyEntity(entity, sub)
    console.log(`Entity by id`, entityIdsAsNumbers[i], entityAsText)
  }
sub.disconnect();
}

main()
