import * as Router from 'koa-router';
import { Context } from 'koa';
import * as Boom from 'boom';

import { TANGLEID_IRI } from '../config';

// @ts-ignore
import { register, resolver, IdenityRegistry } from '@tangleid/did';

// TangleID API only register/resolve the identity in main-net.
const registry = new IdenityRegistry({
  providers: {
    '0x1': TANGLEID_IRI,
  },
});
export class TangleIdCtrl {
  public register = async (ctx: Context) => {
    const {
      publicKey,
    }: {
      publicKey: string;
    } = ctx.request.body as any;

    if (!publicKey || typeof publicKey !== 'string') {
      throw Boom.badRequest('publicKey does not exist');
    }

    const { seed, did, document } = await register({
      network: '0x1',
      publicKey,
      registry,
    });
    ctx.status = 201;
    ctx.body = {
      did,
      seed,
      document,
    };
  }

  public reslove = async (ctx: Context) => {
    const did = ctx.params.did;
    if (!did || typeof did !== 'string') {
      throw Boom.badRequest('did does not exist');
    }

    try {
      const document = await resolver(did, registry);
      ctx.body = document;
    } catch (error) {
      throw Boom.notFound('identity not found');
    }
  }
}

export const mount = (apiRouter: Router, ctrl: TangleIdCtrl) => {
  const router = new Router();

  router.get('/:did', ctrl.reslove);
  router.post('/', ctrl.register);

  // mount
  apiRouter.use('/did', router.routes());
};
