import * as forge from 'node-forge';
import * as fs from 'fs';
import * as path from 'path';

export class CryptoService {

  public static create(basedir: string) {
    const publicKeyPem = fs.readFileSync(path.resolve(basedir, 'publicKey.pem'), 'utf8');
    const privateKeyPem = fs.readFileSync(path.resolve(basedir, 'privateKey.pem'), 'utf8');

    return new CryptoService(publicKeyPem, privateKeyPem);
  }

  private publicKey: forge.pki.rsa.PublicKey;
  private privateKey: forge.pki.rsa.PrivateKey;

  constructor(publicKeyPem: string, privateKeyPem: string) {
    this.publicKey = forge.pki.publicKeyFromPem(publicKeyPem) as forge.pki.rsa.PublicKey;
    this.privateKey = forge.pki.privateKeyFromPem(privateKeyPem) as forge.pki.rsa.PrivateKey;
  }

  public getPublicKey() {
    // console.log();
    const publicKeyToPem = forge.pki.publicKeyToPem(this.publicKey);

    return publicKeyToPem;
  }

  public encryptPrivateKey(key: string) {
    const buffer = this.publicKey.encrypt(forge.util.encodeUtf8(key), 'RAW');
    const encrypted = forge.util.encode64(buffer);

    return encrypted;
  }

  public decryptPrivateKey(encrypted: string) {
    const buffer = forge.util.decode64(encrypted);
    const decrypted = forge.util.decodeUtf8(this.privateKey.decrypt(buffer, 'RAW'));

    return decrypted;
  }
}
