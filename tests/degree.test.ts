import * as forge from 'node-forge';
import * as request from 'supertest';
import { createApp } from '../src/app';
import { Server } from 'net';

describe('degree scenario', () => {
  let server: Server;

  beforeAll(async () => {
    const app = await createApp();
    server = app.listen(3000);
  });

  afterAll(() => {
    server.close();
  });

  const encryptSessionKey = (aeskey: string, publicKeyPem: string) => {
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem) as forge.pki.rsa.PublicKey;
    const sessionKey = publicKey.encrypt(aeskey);

    return forge.util.encode64(sessionKey);
  };

  const encryptPrivateKey = (privateKeyPem: string, key: string, iv: string) => {
    const cipher = forge.cipher.createCipher('AES-CBC', key);
    cipher.start({ iv });
    cipher.update(forge.util.createBuffer(privateKeyPem));
    cipher.finish();

    const encrypted = cipher.output.bytes();

    return forge.util.encode64(encrypted);
  };

  it('issuer identifier registration and generate verifiable credential ', async () => {

    // generate user RSA keypiar
    const keypair = forge.pki.rsa.generateKeyPair();
    const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
    const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

    // identifier registeration
    let response = await request(server)
      .post('/api/did').send({
        publicKey: publicKeyPem,
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    const { did } = response.body;

    // generate AES key for user private key encryption
    const key = forge.random.getBytesSync(16);

    // generate initial vector
    const iv = forge.random.getBytesSync(16);
    // or empty 16 bytes initial vector
    // const iv = Buffer.alloc(16).toString();

    // encrypt user private key with AES
    const privateKey = encryptPrivateKey(privateKeyPem, key, iv);

    // encrypt the AES key with server-side public key
    response = await request(server).get('/api/publicKey');
    const serverPublicKey = response.text;
    const sessionKey = encryptSessionKey(key, serverPublicKey);

    // tslint:disable-next-line:no-console
    console.log(privateKey);
    // tslint:disable-next-line:no-console
    console.log(sessionKey);

    // generate the signed credential
    response = await request(server)
      .post('/api/scenario/degree/sign')
      .send({
        issuer: did,
        privateKey,
        sessionKey,
        iv: forge.util.bytesToHex(iv),
        ipfs: 'http://example.edu/credentials/58473',
        timestamp: '2019-08-01T00:00:00Z',
        holder: 'did:tangle:MoWYKbBfezWbsTkYAngUu523F8YQgHfARhWWsTFSN2U45eAMpsSx3DnrV4SyZHCFuyDqjvQdg7',
        type: '畢業證書',
        issuerName: '香港科技大學',
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    const credential = response.body;

    // verify the verifiable credential
    response = await request(server)
      .post('/api/scenario/degree/verify')
      .send({
        credential: JSON.stringify(credential),
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    // tslint:disable-next-line:no-console
    console.log(response.body);

    expect(response.body.verified).toBe(true);
  }, 1200000);
});
