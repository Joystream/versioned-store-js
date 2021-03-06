import { ClassIdInputType } from './ClassIdType';
import ClassId from '@joystream/types/lib/versioned-store/ClassId';

export type CreateEntityInputType = {
  classId: ClassIdInputType
}

export type CreateEntityOutputType = {
  class_id: ClassId
}