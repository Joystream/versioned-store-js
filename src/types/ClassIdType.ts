import ClassId from '@joystream/types/versioned-store/ClassId';
import { Text } from '@polkadot/types';

export type ClassIdInputType = ClassId | number;

export type ClassName = string | Text

export type ClassIdandName = {
	classId: ClassId,
	className: ClassName
};

export type ClassNameAndSchemas = {
	className: string,
	schemaIds: number[]
}

export type ClassIdToNameMap =
	Map<number, string>;

export type ClassNameToIdMap =
	Map<string,number>;

export type ClassIdToNameAndSchemasMap =
	Map<number, ClassNameAndSchemas>;