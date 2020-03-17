import { ClassIdInputType } from './ClassIdType';
import ClassId from '@joystream/types/lib/versioned-store/ClassId';
import { VecProperty, VecU16 } from '@joystream/types/lib/versioned-store';
import { PropertyName, PropertyInputType, PropertyInputByClassNameType } from './PropertyTypes';

export type AddClassSchemaInputType = {
  classId: ClassIdInputType,
  existingProperties?: PropertyName[],
  newProperties?: PropertyInputType[]
}

export type AddClassSchemaInputByClassNameType = {
  classId: string,
  existingProperties?: PropertyName[],
  newProperties?: PropertyInputByClassNameType[]
}

export type AddClassSchemaOutputType = {
  class_id: ClassId,
  existing_properties: VecU16,
  new_properties: VecProperty
}

export interface ClassSchemaInputByClassNameType {
  default: [
    { 
    classId: string;
    existingProprties?: PropertyName[];
    newProperties?: PropertyInputByClassNameType[]
    }
  ]
}