import * as Router from 'koa-router';
import { Context } from 'koa';
import * as Boom from 'boom';

import { TangleIdService } from '../services/TangleIdService';
import { generateSeed } from '../uitils';

export class TangleIdCtrl {
  private tangleidService: TangleIdService;
  constructor(tangleidService: TangleIdService) {
    this.tangleidService = tangleidService;
  }

  public register = async (ctx: Context) => {
    const {
      publicKey,
    }: {
      publicKey: string;
    } = ctx.request.body as any;

    if (!publicKey || typeof publicKey !== 'string') {
      throw Boom.badRequest('publicKey does not exist');
    }

    const seed = generateSeed();
    const { did, document } = await this.tangleidService.registerIdentifier('0x1', seed, [publicKey]);
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
      const document = await this.tangleidService.resolveIdentifier(did);
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
