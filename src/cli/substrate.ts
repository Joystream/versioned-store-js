// tslint:disable-next-line:import-name
import BN from 'bn.js';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import { KeyringPair } from '@polkadot/keyring/types';
import { KeypairType } from '@polkadot/util-crypto/types';
import { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import { RpcEndpoints, greenItem } from './utils';
import { registerJoystreamTypes } from '@joystream/types';
import ClassId from '@joystream/types/lib/versioned-store/ClassId';
import EntityId from '@joystream/types/lib/versioned-store/EntityId';
import { Class, Entity } from '@joystream/types/lib/versioned-store';
import PropertyTypeName from '@joystream/types/lib/versioned-store/PropertyTypeName';
import { EventData } from '@polkadot/types/primitive/Generic/Event';
import ClassPermissions from '@joystream/types/lib/versioned-store/permissions/ClassPermissions'
import { Credential } from '@joystream/types/lib/versioned-store/permissions/credentials';
import { Option, u16 } from '@polkadot/types';

import {
  PropertyByNameMap, PropertyIndexToNameMap, 
  CreateClassInputType, ClassIdToNameMap, ClassNameToIdMap, ClassIdToNameAndSchemasMap,
  AddClassSchemaInputType,
  CreateEntityInputType, AddSchemaSupportToEntityInputType, UpdateEntityPropertyValuesInputType
} from '../types';

import {
  transformCreateClass, transformAddClassSchema, transformCreateEntity,
  transformAddSchemaSupportToEntity, transformUpdateEntityPropertyValues
} from '../transform';


export type KeypairProps = {

  // Example: '//Alice'
  uri: string,

  // Example: 'sr25519'
  type: KeypairType,

  pass?: string
}

export class Substrate {

  api: ApiPromise

  keypair: KeyringPair

  constructor () {}

  public connect = async () => {
    const rpcEndpoint = RpcEndpoints.localhost;
    const provider = new WsProvider(rpcEndpoint);

    // Register types before creating the API:
    registerJoystreamTypes();

    // Create the API and wait until ready:
    console.log(`Connecting to Substrate API: ${rpcEndpoint}`)
    this.api = await ApiPromise.create({provider});

    await this.api.isReady;

    // Retrieve the chain & node information information via rpc calls
    const system = this.api.rpc.system;
    const [ chain, nodeName, nodeVersion ] = await Promise.all(
      [ system.chain(), system.name(), system.version() ]);

    console.log(`Connected to chain '${chain}' (${nodeName} v${nodeVersion})`)
  }

  public disconnect = () => {
    const { api } = this;
    if (api && api.isReady) {
      api.disconnect();
      console.log(`Disconnect from Substrate API.`);
    }
  }

  /**
   * Shortcut for versioned store query.
   */
  get vsQuery () {
    return this.api.query.versionedStore;
  }

  get vsPermissionsQuery () {
    return this.api.query.versionedStorePermissions;
  }

  get vsTx () {
    return this.api.tx.versionedStorePermissions;
  }

  // Make a dispatchable call via sudo. Assumes this.keypair was set with the sudo key
  public makeSudoCall (tx: SubmittableExtrinsic, interestingEventName?: string) {
    return this.signTxAndSend(this.api.tx.sudo.sudo(tx), interestingEventName);
  }

  public setKeypair = (props: KeypairProps) => {
    const keyring = new Keyring()

    // TODO allow to import account via JSON file:
    // const keypair = keyring.addFromJson(accountJson)

    // TODO allow to import account via seed.
    // const keypair = keyring.addFromSeed(props.seed, null, props.type)

    const keypair = keyring.addFromUri(props.uri, null, props.type)

    if (keypair.isLocked) {
      if (props.pass) {
        keypair.decodePkcs8(props.pass);
      } else {
        // TODO (improvement) ask a password to this account in terminal
        throw new Error(`Not implemented: Get an account pass from terminal`)
      }
    }

    console.log(`Next account will be used for signing txs:`,
      {
        address: keypair.address,
        type: keypair.type
      }
    )

    this.keypair = keypair;
  }

  public accountAddress = () => {
    return this.keypair.address
  }

  public accountBalance = async () => {
    return await this.api.query.balances.freeBalance(this.accountAddress()) as unknown as BN
  }

  public nextClassId = async () => {
    return await this.vsQuery.nextClassId() as unknown as ClassId
  }

  public nextEntityId = async () => {
    return await this.vsQuery.nextEntityId() as unknown as EntityId
  }

  public getAllClassIds = async (): Promise<ClassId[]> => {
    const nextId = await this.vsQuery.nextClassId() as unknown as ClassId;

    if (!nextId || nextId.lte(new BN(1))) {
      return [];
    }

    const nextIdAsNum = nextId.toNumber();
    const ids: ClassId[] = [];
    for (let i = 1; i < nextIdAsNum; i++) {
      ids.push(new ClassId(i));
    }
    return ids;
  }

  public getAllEntityIds = async (): Promise<EntityId[]> => {
    const nextId = await this.vsQuery.nextEntityId() as unknown as EntityId;

    if (!nextId || nextId.lte(new BN(1))) {
      return [];
    }

    const nextIdAsNum = nextId.toNumber();
    const ids: EntityId[] = [];
    for (let i = 1; i < nextIdAsNum; i++) {
      ids.push(new EntityId(i));
    }
    return ids;
  }

  public getClassById = async (id: ClassId | number): Promise<Class> => {
    return await this.vsQuery.classById(id) as unknown as Class
  }

  public getEntityById = async (id: EntityId | number): Promise<Entity> => {
    return await this.vsQuery.entityById(id) as unknown as Entity
  }

  public signTxAndSend = async (tx: SubmittableExtrinsic, interestingEventName?: string): Promise<EventData | undefined> => {

    const balance = await this.accountBalance()
    console.log(`Account balance:`, balance.toString(), 'tokens')
    if (balance.lt(new BN(1))) {
      console.log(`Not enough tokens to execute a tx`)
      return undefined
    }

    // Output call details to be used in future
    console.log(JSON.stringify({
      "sectionName": tx.method.sectionName,
      "methodName": tx.method.methodName,
      "args": tx.method.args.map((arg) => arg.toJSON())
    }));

    // Get the nonce for this account:
    const nonce = await this.api.query.system.accountNonce(this.keypair.address) as unknown as Uint8Array;

    return await new Promise<EventData>((resolve, reject) => tx
      .sign(this.keypair, { nonce })
      .send(({ events = [], status }) => {
        console.log('Transaction status:', status.type);

        if (status.isFinalized) {
          console.log('Completed at block hash', status.asFinalized.toHex());
          console.log('Events:');

          let eventData: EventData = undefined
          events.forEach(({ phase, event: { data, method, section } }) => {
            console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
            if (interestingEventName && interestingEventName === method) {
              eventData = data
            }
          });

          resolve(eventData)
          //returns undefined for batched TXes. 
          //How about returning an array of all entityIds in the batch?
        }
      }).catch(reject)
    )
  }

  public classIdToNameMap = async (): Promise<ClassIdToNameMap> => {
    const classIds = await this.getAllClassIds()
    const ids = (`${classIds}`).split(",").map(Number);
    const map: ClassIdToNameMap = new Map();
    for (let i=0; i<classIds.length; i++) {
      const clazz = await this.getClassById(classIds[i])
      map.set(ids[i],clazz.name.toString())
    }
    return map
  }

  public classIdToNameAndSchemasMap = async (): Promise<ClassIdToNameAndSchemasMap> => {
    const classIds = await this.getAllClassIds()
    const ids = (`${classIds}`).split(",").map(Number);
    const map: ClassIdToNameAndSchemasMap = new Map();
    for (let i=0; i<classIds.length; i++) {
      const schemaIds: number[] = []
      const clazz = await this.getClassById(classIds[i])
      const className = clazz.name.toString()
      for (let n=0; n<clazz.schemas.length; n++) {
        schemaIds.push(n)
      }
      map.set(ids[i], { className, schemaIds })
    }
    return map
  }

  public classNameToIdMap = async (): Promise<ClassNameToIdMap> => {
    const classIdsToNameMap = await this.classIdToNameMap()

    const map: ClassNameToIdMap = new Map();
    for (let n of Array.from(classIdsToNameMap.keys()) ) {
      map.set(classIdsToNameMap.get(n), n)
    }
    return map
  }

  public entitiyIdsInClass = async (classIdinput:ClassId): Promise<EntityId[]> => {
    const classId = classIdinput
    const classMap = await this.classIdToNameMap()
    if (!classMap.has(classId.toNumber())) {
      throw new Error(`Class not found by id ${classId.toNumber()}`)
    } else {
      const entityIds = await this.getAllEntityIds()
      const entityIdArray: EntityId[] = []
      for (let i=0; i<entityIds.length; i++) {
        const entity = await this.getEntityById(entityIds[i])
        if (entity.class_id.toNumber() === classId.toNumber()) {
          const entityId = entity.id
          entityIdArray.push(entityId)
        }
      }
      return entityIdArray
    }
  }

  public entitiesInClass = async (classIdinput:ClassId): Promise<Entity[]> => {
    const classId = classIdinput
    const classMap = await this.classIdToNameMap()
    if (!classMap.has(classId.toNumber())) {
      throw new Error(`Class not found by id ${classId.toNumber()}`)
    } else {
      const entityIds = await this.getAllEntityIds()
      const entityArray: Entity[] = []
      for (let i=0; i<entityIds.length; i++) {
        const entity = await this.getEntityById(entityIds[i])
        if (entity.class_id.toNumber() === classId.toNumber()) {
          entityArray.push(entity)
        }
      }
      return entityArray
    }
  }

  public getClassPropertyMap = async (classId: ClassId): Promise<PropertyByNameMap> => {
    const clazz = await this.getClassById(classId)
    if (!clazz || clazz.id.isZero()) {
      throw new Error(`Class not found by id ${classId.toNumber()}`)
    }

    const map: PropertyByNameMap = new Map();
    clazz.properties.map((prop, index) => {
      const type = prop.prop_type.type as PropertyTypeName
      map.set(prop.name.toString(), { index, type })
    })
    return map
  }

  public propIndexToNameMap = async (classId: ClassId): Promise<PropertyIndexToNameMap> => {
    const clazz = await this.getClassById(classId)
    if (!clazz || clazz.id.isZero()) {
      throw new Error(`Class not found by id ${classId.toNumber()}`)
    }
    const items = clazz.properties
    return new Map(items.map((x, i) => [i, x.name]))
  }

  public getClassSchemaPropertyMap = async (classId: ClassId, schemaId: number): Promise<PropertyByNameMap> => {
    const clazz = await this.getClassById(classId)
    if (!clazz || clazz.id.isZero()) {
      throw new Error(`Class not found by id ${classId.toNumber()}`)
    }
    if (clazz.schemas[schemaId] === undefined) {
      throw new Error(`Schema version ${schemaId} for classId ${classId.toNumber()} doesn't exist`)
    }
    const propMap = await this.getClassPropertyMap(classId)
    const indexPropMap = await this.propIndexToNameMap(classId)

    const inClassIndexSchemaProps:number[] = []
    for (let i=0; i<clazz.schemas[schemaId].properties.length; i++) {
      inClassIndexSchemaProps.push(clazz.schemas[schemaId].properties[i].toNumber())
    }
    const map = propMap

    for (let n of Array.from(indexPropMap.keys()) ) {
      if (!inClassIndexSchemaProps.includes(n)) {
      map.delete(indexPropMap.get(n))
      }
    }
   return map
  }

  public txCreateClassWithDefaultPermissions = async (input: CreateClassInputType) => {
    const txName = 'createClassWithDefaultPermissions'
    const { error, result } = transformCreateClass(input)

    if (error) {
      console.log(`Cannot parse input data for tx '${txName}'`, error)
      return undefined
    }

    const res = await this.signTxAndSend(
      this.vsTx[txName](
        result.name,
        result.description,
      ),
      'ClassCreated'
    )
    console.log(`Tx executed:`, greenItem(txName))
    return res
  }

  public txCreateClass = async (input: CreateClassInputType, classPermissions: ClassPermissions) => {
    const txName = 'createClass'
    const { error, result } = transformCreateClass(input)

    if (error) {
      console.log(`Cannot parse input data for tx '${txName}'`, error)
      return undefined
    }

    const classCreatedEventData = await this.signTxAndSend(
      this.vsTx[txName](
        result.name,
        result.description,
        classPermissions,
      ),
      'ClassCreated'
    )
    console.log(`Tx executed:`, greenItem(txName))
    //console.log({ classCreatedEventData })

    return (classCreatedEventData[0] as any as ClassId).toNumber()
  }

  public txAddClassSchema = async (input: AddClassSchemaInputType, withCredentials: Option<Credential>) => {
    const txName = 'addClassSchema'

    const classId = new ClassId(input.classId)
    const propMap = await this.getClassPropertyMap(classId)
    const { error, result } = transformAddClassSchema(input, propMap)

    if (error) {
      console.log(`Cannot parse input data for tx '${txName}'`, error)
      return undefined
    }

    const classSchemaAddedEventData = await this.signTxAndSend(
      this.vsTx[txName](
        withCredentials,
        result.class_id.toHex(),
        result.existing_properties,
        result.new_properties,
      ),
      'ClassSchemaAdded'
    )
    console.log(`Tx executed:`, greenItem(txName))
    return [(classSchemaAddedEventData[0] as any as ClassId).toNumber(),(classSchemaAddedEventData[1] as any as u16).toNumber()];
  }

  public txCreateEntity = async (input: CreateEntityInputType, withCredentials: Option<Credential>) => {
    const txName = 'createEntity'
    const { error, result } = transformCreateEntity(input)

    if (error) {
      console.log(`Cannot parse input data for tx '${txName}'`, error)
      return undefined
    }

    const entityCreatedEventData = await this.signTxAndSend(
      this.vsTx[txName](
        withCredentials,
        result.class_id.toNumber()
      ),
      'EntityCreated'
    )
    console.log(`Tx executed:`, greenItem(txName))
    return (entityCreatedEventData[0] as any as EntityId).toNumber();
  }

  public txAddSchemaSupportToEntity = async (input: AddSchemaSupportToEntityInputType, withCredentials: Option<Credential>, as_maintainer: boolean) => {
    const txName = 'addSchemaSupportToEntity'

    const entityId = new EntityId(input.entityId)
    const entity = await this.getEntityById(entityId)
    const propMap = await this.getClassPropertyMap(entity.class_id)
    const { error, result } = transformAddSchemaSupportToEntity(input, propMap)

    if (error) {
      console.log(`Cannot parse input data for tx '${txName}'`, error)
      return undefined
    }

    const res = await this.signTxAndSend(
      this.vsTx[txName](
        withCredentials,
        as_maintainer,
        result.entity_id.toNumber(),
        result.schema_id.toNumber(),
        result.property_values,
      ),
      'EntitySchemaAdded'
    )
    console.log(`Tx executed:`, greenItem(txName))
    return res
  }

  public txUpdateEntityPropertyValues = async (input: UpdateEntityPropertyValuesInputType, withCredentials: Option<Credential>, as_maintainer: boolean) => {
    const txName = 'updateEntityPropertyValues'

    const entityId = new EntityId(input.entityId)
    const entity = await this.getEntityById(entityId)
    const propMap = await this.getClassPropertyMap(entity.class_id)
    const { error, result } = transformUpdateEntityPropertyValues(input, propMap)

    if (error) {
      console.log(`Cannot parse input data for tx '${txName}'`, error)
      return undefined
    }

    const res = await this.signTxAndSend(
      this.vsTx[txName](
        withCredentials,
        as_maintainer,
        result.entity_id.toNumber(),
        result.new_property_values
      ),
      'EntityPropertiesUpdated'
    )
    console.log(`Tx executed:`, greenItem(txName))
    return res
  }
}
