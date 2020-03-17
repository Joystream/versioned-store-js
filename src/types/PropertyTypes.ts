import { EntityIdInputType } from './EntityIdType';
import { ClassIdInputType } from './ClassIdType';
import PropertyTypeName from '@joystream/types/lib/versioned-store/PropertyTypeName';

export type PropertyName = string;

export type PropertyIndex = number;

export type SinglePropertyValue = boolean | number | string | EntityIdInputType;

export type PropertyValueInputType = null | SinglePropertyValue | SinglePropertyValue[];

export type PropertyNameAndValueInputType = {
  name: string,
  value: PropertyValueInputType
}

export type ProptyIndexAndType = {
  index: PropertyIndex,
  type: PropertyTypeName
}

export type PropertyByNameMap =
  Map<PropertyName, ProptyIndexAndType>;

export type PropertyIndexToNameMap =
  Map<PropertyIndex, PropertyName>;

export type PropertyInputType = {
  type: PropertyTypeName
  required?: boolean
  name: string
  description: string
  classId?: ClassIdInputType
  maxItems?: number
  maxTextLength?: number
};

export type PropertyInputByClassNameType = {
  type: PropertyTypeName
  required?: boolean
  name: string
  description: string
  classId?: string
  maxItems?: number
  maxTextLength?: number
};