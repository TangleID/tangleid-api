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

  public encryptPrivateKey(userKey: string) {
    const key = forge.random.getBytesSync(16);
    const iv = forge.random.getBytesSync(16);

    const cipher = forge.cipher.createCipher('AES-CBC', key);
    cipher.start({ iv });
    cipher.update(forge.util.createBuffer(userKey));
    cipher.finish();
    const encrypted = cipher.output.bytes();

    const keyEncrypted = this.publicKey.encrypt(key);

    return {
      iv: forge.util.bytesToHex(iv),
      key: forge.util.encode64(keyEncrypted),
      encrypted: forge.util.encode64(encrypted),
    };
  }

  public decryptPrivateKey(encrypted: string, key: string, iv: string) {
    const keyBuffer = forge.util.decode64(key);
    const keyDecrypted = this.privateKey.decrypt(keyBuffer);

    const buffer = forge.util.decode64(encrypted);
    const decipher = forge.cipher.createDecipher('AES-CBC', keyDecrypted);
    decipher.start({ iv: forge.util.hexToBytes(iv) });
    decipher.update(forge.util.createBuffer(buffer));
    decipher.finish();

    return decipher.output.toString();
  }
}
