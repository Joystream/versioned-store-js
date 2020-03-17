import * as path from 'path';

export type RpcEndpoint = string;

export const RpcEndpoints = {
  localhost: `ws://127.0.0.1:9944/`,
  testnet:   `wss://testnet.joystream.org/acropolis/rpc/`,
  reckless:  `wss://staging-reckless.joystream.org/reckless/rpc/`,
  lts:       `wss://staging-lts.joystream.org/staging/rpc/`
}

// ---------------------------------------------------
// Console

import chalk from 'chalk';

export function greenItem (x: any) {
  return chalk.green(x)
}

export function yellowItem (x: any) {
  return chalk.yellow(x)
}

export function redItem (x: any) {
  return chalk.red(x)
}

// ---------------------------------------------------
// File System Utils

const rootDir = process.cwd();

const pathFromRoot = (subPath: string): string => {
  return path.join(rootDir, subPath);
}

const pathFromDataDir = (...subPaths: string[]): string => {
  return path.join(pathFromRoot(`data`), ...subPaths);
}

export const ACCOUNTS_FOLDER = pathFromDataDir(`accounts`);


// Converting

export function stringToArray(input:string) {
  const array:string[] = []
  input.split(',').forEach((value:string) => {
    array.push(value)
  })
  return array
}

export function stringToText(input:string) {
  return input
  .replace(/%/g," ")
}

export function convertFromCamelCase(input:string) {
  return input
  .replace(/([A-Z])/g, ' $1')
  .replace(/^./, function(str){ return str.toUpperCase(); })
}

export function convertToCamelCase(input:string) {
  return input
  .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });
}