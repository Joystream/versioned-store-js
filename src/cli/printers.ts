import { Class, VecProperty, Entity } from '@joystream/types/lib/versioned-store';

// tslint:disable-next-line:import-name
import BN from 'bn.js';
import { PropertyIndexToNameMap } from '../types/PropertyTypes';
import { Substrate } from './substrate';
import { yellowItem } from './utils';

export function arrayToMultiLineString(array: any[] | void) {
  return !array ? '' : array.map((item, i) => 
    `  ${i+1}) ${yellowItem(item ? item.toString() : 'undefined')}`
  ).join('\n')
}

export function arrayToOneLineString(array: any[] | void) {
  const inner = !array ? '' : array.map(item => 
    `${yellowItem(item ? item.toString() : 'undefined')}`
  ).join(', ')
  return `[${inner}]`
}

export function classNameList (x?: Class | void) {
  if (!x) return undefined

  return x.name.toString()
}

function bnsToNumbers<T extends BN>(bns: T[]): number[] {
  return !bns ? [] : bns.map(x => x.toNumber())
}

function prettyClassSchemas (clazz: Class) {
  const propMap = propIndexToNameMap(clazz.properties)
  return clazz.schemas.map((x, i) => ({
    in_class_index: i,
    properties: x.properties.map(idx => ({
      in_class_index: idx,
      name: propMap.get(idx.toNumber())
    }))
  }))
}

function prettyClassProps (items: VecProperty) {
  return items.map((x, i) => ({
    in_class_index: i,
    required: x.required,
    type: x.prop_type.toJSON(),
    name: x.name,
    description: x.description
  }))
}

function propIndexToNameMap (items: VecProperty): PropertyIndexToNameMap {
  return new Map(items.map((x, i) => [i, x.name]))
}

export function prettyClass (x?: Class | void) {
  if (!x) return undefined

  return JSON.stringify({
    id: x.id.toNumber(),
    name: x.name.toString(),
    description: x.description.toString(),
    properties: prettyClassProps(x.properties),
    schemas: prettyClassSchemas(x)
  }, null, 2)
}

async function prettyEntityValues (entity: Entity, sub: Substrate) {
  const { class_id } = entity
  const clazz = await sub.getClassById(class_id)
    .catch(err => console.log(`Failed to get class by id '${class_id}'`, err));

  if (!clazz) throw new Error(`Class not found`)
  
  const propNameByIndex = propIndexToNameMap(clazz.properties)

  return entity.entity_values.map((x, i) => {
    const prop_index = x.in_class_index.toNumber()
    return {
      value_index: i,
      prop_index,
      prop_name: propNameByIndex.get(prop_index),
      value: x.value.toJSON()
    }
  })
}

export async function prettyEntity (x: Entity | void, sub: Substrate) {
  if (!x) return undefined

  const values = await prettyEntityValues(x, sub)

  return JSON.stringify({
    id: x.id.toNumber(),
    class_id: x.class_id.toNumber(),
    in_class_schema_indexes: bnsToNumbers(x.in_class_schema_indexes),
    values
  }, null, 2)
}