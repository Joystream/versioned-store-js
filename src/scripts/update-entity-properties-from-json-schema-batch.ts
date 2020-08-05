import { Substrate } from "../cli/substrate";
import { prettyEntity } from '../cli/printers';
import { checkForDuplicateExistingClassNames } from "../cli/checks";
import { Credential } from '@joystream/types/common';
import { bool, u32, Option, Vec } from '@polkadot/types';
import { OperationType} from '@joystream/types/versioned-store/permissions/batching/operation-types';
import { Operation } from '@joystream/types/versioned-store/permissions/batching/';
import ClassId from '@joystream/types/versioned-store/ClassId';
import EntityId from '@joystream/types/versioned-store/EntityId';
import { ParametrizedEntity } from '@joystream/types/versioned-store/permissions/batching/parametrized-entity';
import { ParametrizedPropertyValue } from '@joystream/types/versioned-store/permissions/batching/parametrized-property-value';
import ParametrizedClassPropertyValue from '@joystream/types/versioned-store/permissions/batching/ParametrizedClassPropertyValue';
import { transformPropertyValueToEnum } from '../transformPropertyValueToEnumValue'
import { PropertyByNameMap, UpdateEntityPropertyValuesInputType } from '../types';
import { PropertyValueEnumValue } from '@joystream/types/versioned-store/PropertyValue';

import entityJsons = require('../inputs/entity-values/update-entities/index.js');

import {
  CURRENT_LEAD_CREDENTIAL
} from './credentials';


const classNamesInput = process.argv[2] as string
//console.log(classNamesInput)


const classNameArray:string[] = classNamesInput.split(',')
console.log(classNameArray)


//console.log("entityJsons",entityJsons)

const entitityInput:UpdateEntityPropertyValuesInputType[][] = []
const entityIdsAsNumbers:number[] = []
for (let i=0; i<classNameArray.length; i++) {
  let entitityInputClass:UpdateEntityPropertyValuesInputType[] = []
  for (let n=0; n<entityJsons.default.length; n++ ) {
    const index = entityJsons.default[n].classId.indexOf(classNameArray[i])
    if (index != -1) {
      for (let m=0; m<entityJsons.default[n].entities.length; m++) {
        entitityInputClass = entityJsons.default[n].entities
        entityIdsAsNumbers.push(entityJsons.default[n].entities[m].entityId)
      }
    }
  }
  entitityInput.push(entitityInputClass)
}

console.log("entitityInput",entitityInput)


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
  const inClassIndexClassArray:u32[][][] = []
  for (let i=0; i<entitityInput.length; i++) {
    const enumsArray:PropertyValueEnumValue[][] = []
    const entityIdsArray:EntityId[] = []
    const inClassIndexArray:u32[][] = []
    for (let n=0; n<entitityInput[i].length; n++ ) {
      const schema_with_values = entitityInput[i][n]
      const entityEnum: PropertyValueEnumValue[] = []
      const inClassIndexValueArray:u32[] = []
      schema_with_values.entityId
      for (let m=0; m<entitityInput[i][n].newPropertyValues.length; m++ ) {
        const propType = (classPropertyMaps[i].get(entitityInput[i][n].newPropertyValues[m].name)).type
        const value = entitityInput[i][n].newPropertyValues[m].value
        const in_class_index = new u32((classPropertyMaps[i].get(entitityInput[i][n].newPropertyValues[m].name)).index)
        const propertyValueEnum:PropertyValueEnumValue = transformPropertyValueToEnum(propType,value)
        entityEnum.push(propertyValueEnum)
        inClassIndexValueArray.push(in_class_index)
      }
      enumsArray.push(entityEnum)
      entityIdsArray.push(new EntityId(schema_with_values.entityId))
      inClassIndexArray.push(inClassIndexValueArray)
    }
    enumsClassArray.push(enumsArray)
    entityIdsInClassArray.push(entityIdsArray)
    inClassIndexClassArray.push(inClassIndexArray)
  }
  // Batch Operations to execute in order..
  let batch: Vec<Operation> = new Vec(Operation);

  for (let i=0; i<enumsClassArray.length; i++) {
    for (let n=0; n<enumsClassArray[i].length; n++) {
      const parametrizedPropertyValues:ParametrizedClassPropertyValue[] = []
      for (let m=0; m<enumsClassArray[i][n].length; m++) {
        parametrizedPropertyValues.push(new ParametrizedClassPropertyValue({
          in_class_index: inClassIndexClassArray[i][n][m],
          value: ParametrizedPropertyValue.PropertyValue(enumsClassArray[i][n][m])
        }))
      }
      batch.push(new Operation({
        with_credential: new Option(Credential, CURRENT_LEAD_CREDENTIAL),
        as_entity_maintainer: new bool(true),
        operation_type: OperationType.UpdatePropertyValues(
            ParametrizedEntity.ExistingEntity(entityIdsInClassArray[i][n]),
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
