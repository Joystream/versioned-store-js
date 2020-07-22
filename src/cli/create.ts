import { Substrate } from './substrate';
import { transformClassSchemaByNameToId } from "./transform";
import { checkUniqueClassNamesFromJson } from './checks';
import { transformCreateClass, transformAddClassSchema } from "../transform";
import { CreateClassInputType,
  PropertyName, PropertyInputType, PropertyInputByClassNameType, PropertyByNameMap,
  AddClassSchemaInputType, AddClassSchemaInputByClassNameType
 } from '../types'
import ClassId from '@joystream/types/versioned-store/ClassId';

export async function createClassJson(name:string, description:string, sub: Substrate): Promise<CreateClassInputType> {
  const classJson: CreateClassInputType = 
  {
    name: name,
    description: description
  }
  await checkUniqueClassNamesFromJson([classJson], sub)
  //catch?
  const transformedClass = transformCreateClass(classJson)
  if (transformedClass.error) {
    console.log("classJson",JSON.stringify(classJson))
    throw new Error(`New classJson has errors: '${transformedClass.error}'`)
  } else {
    console.log("classJson",JSON.stringify(classJson))
    return classJson
  }
}

export async function createClassSchemaJsonFromClassId(classId:number, existingProperties?:PropertyName[], newProperties?: PropertyInputType[], sub?: Substrate): Promise<AddClassSchemaInputType> {
  const classMap = await sub.classIdToNameMap()
  const propMap = await sub.getClassPropertyMap(new ClassId(classId))
  if (classMap.has(classId)) {
    console.log(`ClassId/name: '${classId}'/'${classMap.get(classId)}'`)
  } else {
    console.log(`ClassId: '${classId}' does not exist.`)
  }
  const schemaJson: AddClassSchemaInputType = 
  {
    classId: classId,
    existingProperties: existingProperties,
    newProperties: newProperties
  }
  const transformedClassSchema = transformAddClassSchema(schemaJson,propMap)
  if (!transformedClassSchema.error.length) {
    console.log("schemaJson",JSON.stringify(schemaJson))
    throw new Error(`New schemaJson has errors: '${transformedClassSchema.error}'`)
  } else {
    console.log("schemaJson",JSON.stringify(schemaJson))
    return schemaJson
  }
}

export async function createClassSchemaJsonFromClassName(className:string, existingProperties?:PropertyName[], newProperties?: PropertyInputByClassNameType[], sub?: Substrate): Promise<AddClassSchemaInputType> {
  console.log("className",className)
  console.log("className",typeof(className))
  console.log("existingProperties",existingProperties)
  console.log("existingProperties",typeof(existingProperties))
  console.log("existingProperties",newProperties)
  console.log("existingProperties",typeof(newProperties))
  const classNameToIdMap = await sub.classNameToIdMap()
  let classId: number
  let propMap: PropertyByNameMap
  if (classNameToIdMap.has(className)) {
    classId = classNameToIdMap.get(className)
    propMap = await sub.getClassPropertyMap(new ClassId(classId))
    console.log(`ClassId/name: '${classId}'/'${className}'`)
  } else {
    console.log(`ClassId: '${classId}' does not exist.`)
    throw new Error(`ClassId: '${classId}' does not exist.`)
  }
  const schemaJson: AddClassSchemaInputByClassNameType = 
  {
    classId: className,
    existingProperties: existingProperties,
    newProperties: newProperties
  }
  const transformedSchemas = await transformClassSchemaByNameToId([schemaJson],sub)
  const transformedClassSchema = transformAddClassSchema(transformedSchemas[0],propMap)
  if (!transformedClassSchema.error.length) {
    console.log("schemaJson",JSON.stringify(transformedSchemas[0]))
    throw new Error(`New schemaJson has errors: '${transformedClassSchema.error}'`)
  } else {
    console.log("schemaJson",JSON.stringify(transformedSchemas[0]))
    return transformedSchemas[0]
  }
}

