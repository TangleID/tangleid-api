import { composeAPI } from '@tangleid/core';
// tslint:disable-next-line:no-submodule-imports
import { PublicKeyMeta } from '@tangleid/core/typings/types';
import { TANGLEID_IRI } from '../config';

export type Func<T> = (...args: any[]) => T;

export function returnType<T>(func: Func<T>) {
  return {} as T; // tslint:disable-line no-object-literal-type-assertion
}

export const apiType = returnType(composeAPI);

export class TangleIdService {
  private tid: typeof apiType;

  constructor() {
    this.tid = composeAPI({
      providers: {
        '0x1': TANGLEID_IRI,
      },
    }) as typeof apiType;
  }

  public async registerIdentifier(network: string, seed: string, publicKeys?: string[]) {
    // tslint:disable-next-line:no-console
    console.log('resolving identifier');
    return this.tid.registerIdentifier(network, seed, publicKeys);
  }

  public async resolveIdentifier(did: string) {
    // tslint:disable-next-line:no-console
    console.log('resolving identifier');
    return this.tid.resolveIdentifier(did);
  }

  public async signRsaSignature(document: any, publicKey: PublicKeyMeta, privateKeyPem: string) {
    // tslint:disable-next-line:no-console
    console.log('signing credential');
    return this.tid.signRsaSignature(document, publicKey, privateKeyPem);
  }

  public async verifyRsaSignature(document: any) {
    // tslint:disable-next-line:no-console
    console.log('verifying credential');
    return this.tid.verifyRsaSignature(document);
  }
}
