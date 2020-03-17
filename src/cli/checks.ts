import { Substrate } from './substrate';

import {
  CreateClassInputType, ClassIdToNameMap
} from '../types';


export async function checkForDuplicateExistingClassNames (sub: Substrate ): Promise<ClassIdToNameMap> {
  console.log("Checking for duplicate names in existing classes:")

  const classMap = await sub.classIdToNameMap()

  const classNames:string[] = []

  for (let n of Array.from(classMap.keys()) ) {
    if (!(classMap.get(n) in classNames)) {
      classNames.push(classMap.get(n))
    } else {
      console.log(`Duplicate class names exists: '${classMap.get(n)}'`)
      throw new Error(`Duplicate class names exists: '${classMap.get(n)}'`)
    }
  }
  console.log("No duplicates in existing classes")
  return classMap
}

export async function checkUniqueClassNamesFromList (newClassesList : string[], sub: Substrate ): Promise<ClassIdToNameMap> {
  console.log("Checking for duplicate names in new classes:")
  const classMap = await checkForDuplicateExistingClassNames(sub)
  //const ids:number[] = Array.from(classMap.keys())
  const names:string[] = Array.from(classMap.values())

  const newNames:string[] = []
  if (newClassesList == [] ) {
    console.log("No new class(name)s provided")
    return classMap
  } else {
    for (let i=0; i < newClassesList.length; i++) {
      const className = newClassesList[i]
      const index = newNames.indexOf(className)
      if (index == -1) {
        newNames.push(className)
      } else {
        console.log(`Duplicate new classname: '${className}'`)
        throw new Error(`Duplicate new classname: '${className}'`)
      }
      if (names.includes(className)) {
        console.log(`New classname '${className}' already exists`)
        throw new Error(`New classname '${className}' already exists`)
      }
    }
  }
  console.log("No duplicates in new classes")
  return classMap
}

export async function checkUniqueClassNamesFromJson (newClassesList : CreateClassInputType[], sub: Substrate ): Promise<ClassIdToNameMap> {
  console.log("Checking for duplicate names in new classes:")
  const classMap = await checkForDuplicateExistingClassNames(sub)
  //const ids:number[] = Array.from(classMap.keys())
  const names:string[] = Array.from(classMap.values())

  const newNames:string[] = []
  if (newClassesList == [] ) {
    console.log("No new class(name)s provided")
    return classMap
  } else {
    for (let i=0; i < newClassesList.length; i++) {
      const className = newClassesList[i].name
      const index = newNames.indexOf(className)
      if (index == -1) {
        newNames.push(className)
      } else {
        console.log(`Duplicate new classnames: '${className}'`)
        throw new Error(`Duplicate new classnames: '${className}'`)
      }
      if (names.includes(className)) {
        console.log(`New classnames '${className}' already exists`)
        throw new Error(`New classnames '${className}' already exists`)
      }
    }
  }
  console.log("No duplicates in new classes")
  return classMap
}
