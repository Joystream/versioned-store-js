import { Substrate } from './substrate';
import ClassId from '@joystream/types/versioned-store/ClassId';
import { ClassIdInputType,
  AddClassSchemaInputType, AddClassSchemaInputByClassNameType,
  PropertyInputType,
  AddSchemaSupportToEntityInputType,
  PropertyNameAndValueInputType, PropertyValueInputType
   } from '../types';
import { EntityIdInputType } from '../types/EntityIdType';
import { validateAddSchemaSupportToEntity } from '../validate';
import { convertToCamelCase } from './utils';

const entitityValueLists:PropertyValueInputType[][] = require('../inputs/entity-values/lists/index')

export function generateEntityJsonSchemaFromList(className:string, schemaId:number, propertyNames:string[]) {

  console.log("propertyNames",propertyNames)

  const camelCaseClassName = convertToCamelCase(className)
  console.log("camelCaseClassName",camelCaseClassName)
  const entities: AddSchemaSupportToEntityInputType[] = []
  const json = {
      classId: className,
      entities: entities
    }
  let entityId: EntityIdInputType = 1
  for (let i=0; i<entitityValueLists["entityValueList"].length; i++) {
    if (entitityValueLists["entityValueList"][i].hasOwnProperty(camelCaseClassName)) {      
      let props = propertyNames.length
      let values = entitityValueLists["entityValueList"][i][camelCaseClassName].length
      let counter = 0
      while (counter < values) {
        const enitityValues: PropertyNameAndValueInputType[] = []
        const schema_with_values:AddSchemaSupportToEntityInputType = {
          entityId: entityId,
          schemaId: schemaId,
          propertyValues: enitityValues
        }
          for (let n=0; n<props; n++) {
            const propName:string = propertyNames[n]
            const propValue:PropertyValueInputType = entitityValueLists["entityValueList"][i][camelCaseClassName][counter]
            enitityValues.push({
              name: propName,
              value: propValue
            })
            counter++
          }
          const validate = validateAddSchemaSupportToEntity(schema_with_values)
          if (validate.valid === true) {
            entities.push(schema_with_values)
            console.log(`Validation success, for entity number ${entityId}`)
            entityId++
          } else {
            throw new Error(`Validation failed with errors: ${validate.errors}, for entity number ${entityId}`)
          }
          //entities.push(schema_with_values)
        //for (let m=0; m<entitityValueLists["entityValueList"][i][camelCaseClassName].length; m++) {
        //for (let n=0; n<propertyNames.length; n++) {
      }
    }
  }
  return json
}

export async function transformNewToAddSchemaSupportToJsonSchema(classId:number,schemaId:number,entityInputJson:any[], sub: Substrate) {
  console.log("classId",classId)
  console.log("schemaId",schemaId)
  const propsInClassSchemaMap = await sub.getClassSchemaPropertyMap(new ClassId(classId),schemaId)

  const entityId: EntityIdInputType = 1
  const entities = []

  const res:object = {
    classId: classId,
    entities: entities
  }
  for (let i=0; i<entityInputJson.length; i++) {
    const enitityValues: PropertyNameAndValueInputType[] = []
    const schema_with_values = {
      entityId: entityId,
      schemaId: schemaId,
      propertyValues: enitityValues
    }
    for (let n=0; n<entityInputJson[i].length; n++) {
      const prop = propsInClassSchemaMap.get(entityInputJson[i][n].propName)
      if ( prop === undefined) {
        throw new Error(`No property name: ${entityInputJson[i][n].propName} in ${classId}`)
      }
      const name = entityInputJson[i][n].propName as unknown as string
      const value = entityInputJson[i][n].propValue as unknown as PropertyValueInputType
      const values = {
      name: name,
      value: value
      }
      enitityValues.push(values)
    }
    const validate = validateAddSchemaSupportToEntity(schema_with_values)
    if (validate.valid === true) {
      entities.push(schema_with_values)
    } else {
      throw new Error(`Validation failed with errors: ${validate.errors}, for input with index ${i}`)
    }
  }
  return res
}

export async function transformClassSchemaByNameToId(schemas:AddClassSchemaInputByClassNameType[], sub: Substrate): Promise<AddClassSchemaInputType[]> {
  //const classMap = await sub.classIdToNameMap()
  const classNameMap = await sub.classNameToIdMap()
  //const classSchemasMap = await sub.classIdToNameAndSchemasMap()
  const transformedSchemas: AddClassSchemaInputType[] = []
  for (let schemaItem in schemas) {
    const className = schemas[schemaItem].classId
    const classIdNumber = classNameMap.get(className)
    //const classId = new ClassId(classIdNumber)
    //const propMap = await sub.getClassPropertyMap(classId)
    let schema_with_values: AddClassSchemaInputType = {
      classId: classIdNumber
    }
    if (schemas[schemaItem].hasOwnProperty("existingProperties")) {
      if (schemas[schemaItem]["existingProperties"] != undefined ) {
        schema_with_values.existingProperties = schemas[schemaItem].existingProperties
      }
    }
    if (schemas[schemaItem].hasOwnProperty("newProperties")) {
      if (schemas[schemaItem]["newProperties"] != undefined ) {
        const newProperties: PropertyInputType[] = []
        for (let i=0; i < schemas[schemaItem].newProperties.length; i++) {
          if (schemas[schemaItem].newProperties[i].type.toString() == 'Internal') {
            const internalId:ClassIdInputType = classNameMap.get(schemas[schemaItem].newProperties[i].classId)
            newProperties.push({
              type: schemas[schemaItem].newProperties[i].type,
              required: schemas[schemaItem].newProperties[i].required || false,
              name: schemas[schemaItem].newProperties[i].name,
              description: schemas[schemaItem].newProperties[i].description,
              classId: internalId
              })
          } else if (schemas[schemaItem].newProperties[i].type.toString() == 'InternalVec') {
            const internalId:ClassIdInputType = classNameMap.get(schemas[schemaItem].newProperties[i].classId)
            newProperties.push({
              type: schemas[schemaItem].newProperties[i].type,
              required: schemas[schemaItem].newProperties[i].required || false,
              name: schemas[schemaItem].newProperties[i].name,
              description: schemas[schemaItem].newProperties[i].description,
              classId: internalId,
              maxItems: schemas[schemaItem].newProperties[i].maxItems
              })
          } else {
            newProperties.push(schemas[schemaItem].newProperties[i] as unknown as PropertyInputType)
          }
        }
        schema_with_values.newProperties = newProperties
      }
    }
    transformedSchemas.push(schema_with_values)
  }
  return transformedSchemas
}
