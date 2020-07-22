import PropertyType from '@joystream/types/versioned-store/PropertyType';
import * as PT from '@joystream/types/versioned-store/PropertyType';
import { TransformationResult } from './transform';
import { PropertyInputType } from './types/PropertyTypes';

export function transformPropertyType(prop: PropertyInputType): TransformationResult<string, PropertyType> {

  const ok = (typeEnum: PT.PropertyTypeEnum) => {
    return { result: new PropertyType({ [prop.type]: typeEnum } ) };
  }

  switch (prop.type) {

    // Primitives:

    case 'None':        return ok(new PT.None());
    case 'Bool':        return ok(new PT.Bool());
    case 'Uint16':      return ok(new PT.Uint16());
    case 'Uint32':      return ok(new PT.Uint32());
    case 'Uint64':      return ok(new PT.Uint64());
    case 'Int16':       return ok(new PT.Int16());
    case 'Int32':       return ok(new PT.Int32());
    case 'Int64':       return ok(new PT.Int64());
    case 'Text':        return ok(new PT.Text(prop.maxTextLength));
    case 'Internal':    return ok(new PT.Internal(prop.classId));

    // Vectors:

    case 'BoolVec':     return ok(new PT.BoolVec(prop.maxItems));
    case 'Uint16Vec':   return ok(new PT.Uint16Vec(prop.maxItems));
    case 'Uint32Vec':   return ok(new PT.Uint32Vec(prop.maxItems));
    case 'Uint64Vec':   return ok(new PT.Uint64Vec(prop.maxItems));
    case 'Int16Vec':    return ok(new PT.Int16Vec(prop.maxItems));
    case 'Int32Vec':    return ok(new PT.Int32Vec(prop.maxItems));
    case 'Int64Vec':    return ok(new PT.Int64Vec(prop.maxItems));
    case 'TextVec':     return ok(PT.TextVec.newTypesafe(prop.maxItems, prop.maxTextLength));
    case 'InternalVec': return ok(PT.InternalVec.newTypesafe(prop.maxItems, prop.classId));

    default: {
      return { error: `Unknown property type name: ${prop.type}` };
    }
  }
}
