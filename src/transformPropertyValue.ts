import * as PV from '@joystream/types/lib/versioned-store/PropertyValue';
import { PropertyValue } from '@joystream/types/lib/versioned-store/PropertyValue';
import { EntityIdInputType } from './types/EntityIdType';
import { TransformationResult } from './transform';
import { PropertyValueInputType } from './types/PropertyTypes';
import PropertyTypeName from '@joystream/types/lib/versioned-store/PropertyTypeName';

export function transformPropertyValue(propType: PropertyTypeName, value: PropertyValueInputType): TransformationResult<string, PropertyValue> {

  const ok = (typeEnum: PV.PropertyValueEnum) => {
    return { result: new PropertyValue({ [propType]: typeEnum }) };
  }

  switch (propType) {

    // Primitives:

    case 'None':        return ok(new PV.None());
    case 'Bool':        return ok(new PV.Bool(value as boolean));
    case 'Uint16':      return ok(new PV.Uint16(value as number));
    case 'Uint32':      return ok(new PV.Uint32(value as number));
    case 'Uint64':      return ok(new PV.Uint64(value as number));
    case 'Int16':       return ok(new PV.Int16(value as number));
    case 'Int32':       return ok(new PV.Int32(value as number));
    case 'Int64':       return ok(new PV.Int64(value as number));
    case 'Text':        return ok(new PV.Text(value as string));
    case 'Internal':    return ok(new PV.Internal(value as EntityIdInputType));

    // Vectors:

    case 'BoolVec':     return ok(new PV.BoolVec(value as boolean[]));
    case 'Uint16Vec':   return ok(new PV.Uint16Vec(value as number[]));
    case 'Uint32Vec':   return ok(new PV.Uint32Vec(value as number[]));
    case 'Uint64Vec':   return ok(new PV.Uint64Vec(value as number[]));
    case 'Int16Vec':    return ok(new PV.Int16Vec(value as number[]));
    case 'Int32Vec':    return ok(new PV.Int32Vec(value as number[]));
    case 'Int64Vec':    return ok(new PV.Int64Vec(value as number[]));
    case 'TextVec':     return ok(new PV.TextVec(value as string[]));
    case 'InternalVec': return ok(new PV.InternalVec(value as EntityIdInputType[]));

    default: {
      return { error: `Unknown property type name: ${propType}` };
    }
  }
}
