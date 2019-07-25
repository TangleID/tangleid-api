import * as Router from 'koa-router';
import { Context } from 'koa';
import * as Boom from 'boom';

import { CryptoService } from '../../services/CryptoService';
import { TangleIdService } from '../../services/TangleIdService';
import { validateSignBody, validateVerifyBody } from './schema';

export class DegreeCtrl {
  private cryptoService: CryptoService;
  private tangleidService: TangleIdService;

  constructor(cryptoService: CryptoService, tangleidService: TangleIdService) {
    this.cryptoService = cryptoService;
    this.tangleidService = tangleidService;
  }

  public issue = async (ctx: Context) => {
    const result = validateSignBody(ctx.request.body);
    if (result.error !== null) {
      const error = result.error.details.shift();
      throw Boom.badRequest(error.message);
    }

    const params = result.value;
    const privateKey = this.cryptoService.decryptPrivateKey(params.privateKey, params.sessionKey, params.iv);

    const credential = {
      '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2018/credentials/examples/v1'],
      type: ['VerifiableCredential'],
      id: params.ipfs,
      issuer: params.issuer,
      issuanceDate: params.timestamp,
      credentialSubject: {
        id: params.holder,
        degree: {
          name: params.type,
          degreeSchool: params.issuerName,
        },
      },
    };

    const document = await this.tangleidService.resolveIdentifier(params.issuer);

    if (document.publicKey.length === 0) {
      throw Boom.internal('publicKey not available');
    }

    const publicKey = document.publicKey[0];
    const credentialSigned = await this.tangleidService.signRsaSignature(credential, publicKey, privateKey);
    ctx.body = credentialSigned;
  }

  public verify = async (ctx: Context) => {
    ctx.request.socket.setTimeout(5 * 60 * 1000);

    const result = validateVerifyBody(ctx.request.body);
    if (result.error !== null) {
      const error = result.error.details.shift();
      throw Boom.badRequest(error.message);
    }

    const params = result.value;
    const verified = await this.tangleidService.verifyRsaSignature(JSON.parse(params.credential));
    ctx.body = { verified };
  }
}

export const mount = (apiRouter: Router, ctrl: DegreeCtrl) => {
  const router = new Router();

  router.post('/sign', ctrl.issue);
  router.post('/verify', ctrl.verify);

  apiRouter.use('/scenario/degree', router.routes());
};
