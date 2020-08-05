import { Substrate } from './substrate';
import { prettyClass, prettyEntity } from '../cli/printers';
import { checkForDuplicateExistingClassNames } from '../cli/checks';
import ClassId from '@joystream/types/versioned-store/ClassId';
import { ClassIdInputType, ClassIdandName, ClassIdToNameMap, ClassNameToIdMap, ClassIdToNameAndSchemasMap } from '../types/ClassIdType';
import BN from 'bn.js';
import { PropertyByNameMap, EntityIdInputType } from '../types';
import { u16 } from '@polkadot/types';

async function classInputTypeCheck(classInput: ClassIdInputType | string, sub: Substrate ): Promise<ClassIdandName>  {

	const classMap = await checkForDuplicateExistingClassNames(sub)
	const classNameToIdMap = await sub.classNameToIdMap()
	if ( typeof classInput === "string") {
		const parsed = parseInt(classInput)
		if(!parseInt(classInput)) {
			console.log("classname passed as string type")
			const className = classInput
			const classId = new ClassId(classNameToIdMap.get(classInput))
			return {classId,className}
		} else {
			console.log("ClassId passed as number type")
			const classId = new ClassId(parsed)
			const className = classMap.get(parsed)
			return {classId,className}
		}
	} else if ( classInput instanceof ClassId ) {
		console.log("ClassId passed as ClassId type")
		const classId = classInput
		const classIdAsNumber = new BN(classInput).toNumber()
		const className = classMap.get(classIdAsNumber)
		return {classId,className}
	} else if ( typeof classInput === "number" ) {
		console.log("ClassId passed as number type")
		const classId = new ClassId(classInput)
		const className = classMap.get(classInput)
		return {classId,className}
	} else {
		throw new Error(`
		classname or id provided: ${classInput},
		is of type ${typeof(classInput)}`)
	}
}

export async function getPropertyInClassMap (classInput: ClassIdInputType | string, sub?: Substrate ): Promise<PropertyByNameMap> {
	const classType = await classInputTypeCheck(classInput, sub)
	const classId = classType.classId
	const className = classType.className

	console.log(`Getting property map for,
	Class name/Id: '${className}'/'${classId}'`)
	const res = await sub.getClassPropertyMap(classId)
	return res
}

export async function getPropertyInClassSchemaMap (classInput: ClassIdInputType | string, schemaIdInput: number | u16, sub?: Substrate ): Promise<PropertyByNameMap> {
	const classType = await classInputTypeCheck(classInput, sub)
	const classId = classType.classId
	const className = classType.className
	let schemaId:number = 0
	if (typeof(schemaIdInput) === 'number') {
		schemaId = schemaIdInput
	} else {
		schemaId = schemaIdInput.toNumber()
	}
	console.log(`Getting property map for,
	Class name/Id: '${className}'/'${classId}' with schemaId: '${schemaId}'`)
	const res = await sub.getClassSchemaPropertyMap(classId, schemaId)
	return res
}

export async function getRequiredPropertyInClassMap (classInput: ClassIdInputType | string, sub?: Substrate ): Promise<PropertyByNameMap> {
	const classType = await classInputTypeCheck(classInput, sub)
	const classId = classType.classId
	const className = classType.className
	
	const clazz = await sub.getClassById(classId)
		.catch(err => console.log(`Failed to get class by id '${classId}'`, err));

	const classData = JSON.parse(prettyClass(clazz))

	const propMap = await sub.getClassPropertyMap(classId)
	const indexPropMap = await sub.propIndexToNameMap(classId)

	console.log(`Getting property required map names for,
	Class name/Id: '${className}'/'${classId}'`)

	const inClassIndexProps:number[] = []
	for (let i=0; i<classData.properties.length; i++) {
		if (classData.properties[i].required == true) {
			inClassIndexProps.push(classData.properties[i].in_class_index)
		}
	}
	const res = propMap

	for (let n of Array.from(indexPropMap.keys()) ) {
		if (!inClassIndexProps.includes(n)) {
			res.delete(indexPropMap.get(n))
		}
	}
 return res
}

export async function getRequiredPropertyInClassSchemaMap (classInput: ClassIdInputType | string, schemaIdInput: number | u16, sub?: Substrate ): Promise<PropertyByNameMap> {
	const classType = await classInputTypeCheck(classInput, sub)
	const classId = classType.classId
	const className = classType.className
	let schemaId:number = 0
	if (typeof(schemaIdInput) === 'number') {
		schemaId = schemaIdInput
	} else {
		schemaId = schemaIdInput.toNumber()
	}
	
	const clazz = await sub.getClassById(classId)
		.catch(err => console.log(`Failed to get class by id '${classId}'`, err));

	const classData = JSON.parse(prettyClass(clazz))

	const propMap = await sub.getClassSchemaPropertyMap(classId, schemaId)
	const indexPropMap = await sub.propIndexToNameMap(classId)

	console.log(`Getting property required map names for,
	Class name/Id: '${className}'/'${classId}' with schemaId: '${schemaId}'`)

	const inClassIndexProps:number[] = []
	for (let i=0; i<classData.properties.length; i++) {
		if (classData.properties[i].required == true) {
			inClassIndexProps.push(classData.properties[i].in_class_index)
		}
	}
	const res = propMap

	for (let n of Array.from(indexPropMap.keys()) ) {
		if (!inClassIndexProps.includes(n)) {
			res.delete(indexPropMap.get(n))
		}
	}
 return res
}

export async function getClassIdToNameMap(sub:Substrate):Promise<ClassIdToNameMap> {
	const res = await sub.classIdToNameMap()
	return res
}

export async function getClassNameToIdMap(sub:Substrate):Promise<ClassNameToIdMap> {
	const res = await sub.classNameToIdMap()
	return res
}

export async function getClassIdToNameAndSchemasMap(sub:Substrate):Promise<ClassIdToNameAndSchemasMap> {
	const res = await sub.classIdToNameAndSchemasMap()
	return res
}

export async function getEntityByItsId(entityId:EntityIdInputType,sub:Substrate) {
	const enitity = await sub.getEntityById(entityId)
	const res = await prettyEntity(enitity,sub)
	return res
}

export async function getEntityIdNumberInClass(classInput: ClassIdInputType | string,sub:Substrate) {
	const classType = await classInputTypeCheck(classInput, sub)
	const classId = classType.classId
	const className = classType.className
	
	const entitiIdArray = await sub.entitiyIdsInClass(classId)

	console.log(`Getting entity Ids in,
	Class name/Id: '${className}'/'${classId}'`)

	const res:number[] = []
	for (let i=0; i<entitiIdArray.length; i++) {
		res.push(entitiIdArray[i].toNumber())
	}	
 return res
}

export async function getTotalEntitiesClass(classInput: ClassIdInputType | string,sub:Substrate) {
	const classType = await classInputTypeCheck(classInput, sub)
	const classId = classType.classId
	const className = classType.className
	
	const entitiIdArray = await sub.entitiyIdsInClass(classId)

	console.log(`Getting number of entities in,
	Class name/Id: '${className}'/'${classId}'`)

	const res:number = entitiIdArray.length
 return res
}