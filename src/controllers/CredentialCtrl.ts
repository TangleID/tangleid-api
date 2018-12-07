import * as Router from 'koa-router';
import { Context } from 'koa';
import * as Boom from 'boom';

import { TangleIdService } from '../services/TangleIdService';
import { CredentialSchema } from './CredentialSchema';

export class CredentialCtrl {
  private tangleidService: TangleIdService;
  private credentialSchema = new CredentialSchema();

  constructor(tangleidService: TangleIdService) {
    this.tangleidService = tangleidService;
  }

  public issue = async (ctx: Context) => {
    const result = this.credentialSchema.validateSignBody(ctx.request.body);
    if (result.error !== null) {
      const error = result.error.details.shift();
      throw Boom.badRequest(error.message);
    }

    const params = result.value;
    const credential = {
      '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2018/credentials/examples/v1'],
      type: ['VerifiableCredential'],
      id: params.credentialUri,
      issuanceDate: params.credentialIssuanceDate,
      credentialSubject: {
        id: params.subjectId,
        degree: {
          name: params.degreeName,
          degreeSchool: params.degreeSchool,
        },
      },
    };

    const document = await this.tangleidService.resolveIdentifier(params.issuerId);

    if (document.publicKey.length === 0) {
      throw Boom.internal('publicKey not available');
    }

    const publicKey = document.publicKey[0];
    const credentialSigned = await this.tangleidService.signRsaSignature(credential, publicKey, params.privateKeyPem);
    ctx.body = credentialSigned;
  }

  public verify = async (ctx: Context) => {
    ctx.request.socket.setTimeout(5 * 60 * 1000);

    const result = this.credentialSchema.validateVerifyBody(ctx.request.body);
    if (result.error !== null) {
      const error = result.error.details.shift();
      throw Boom.badRequest(error.message);
    }

    const params = result.value;
    const verified = await this.tangleidService.verifyRsaSignature(JSON.parse(params.credential));
    ctx.body = { verified };
  }
}

export const mount = (apiRouter: Router, ctrl: CredentialCtrl) => {
  const router = new Router();

  router.post('/sign', ctrl.issue);
  router.post('/verify', ctrl.verify);

  apiRouter.use('/credential', router.routes());
};
