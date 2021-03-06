import * as Koa from 'koa';
import * as koaBody from 'koa-body';
import * as Router from 'koa-router';
import * as cors from '@koa/cors';

// controllers
import { IdentifierCtrl, mount as mountIdentifier } from './controllers/IdentifierCtrl';
import { CredentialCtrl, mount as mountCredential } from './controllers/CredentialCtrl';
import { DegreeCtrl, mount as mountTuring } from './controllers/degree/DegreeCtrl';
import { CryptoService } from './services/CryptoService';
import { TangleIdService } from './services/TangleIdService';

export const createApp = async (): Promise<Koa> => {
  const corsMid = cors();

  const app = new Koa();
  // Error handling
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.log(err);
      const statusCode =
        (err.isBoom && err.output && err.output.statusCode) ? err.output.statusCode : err.status || 500;

      ctx.status = statusCode;
      // tslint:disable-next-line:no-console
      console.log(statusCode);
      ctx.body = { message: err.message };
    }
  });
  app.use(koaBody({ multipart: true }));
  const rootRouter = new Router();
  const apiRouter = new Router();

  // health check
  rootRouter.get('/', async ctx => {
    ctx.body = 'running healthy!';
  });

  // robot
  rootRouter.get('/robots.txt', async ctx => {
    ctx.body = 'User-agent: *\nAllow:';
  });

  rootRouter.all('*', corsMid);

  const tangleidService = new TangleIdService();
  const cryptoService = CryptoService.create('.');

  const identifierCtrl = new IdentifierCtrl(tangleidService);
  const credentialCtrl = new CredentialCtrl(tangleidService);
  const degreeCtrl = new DegreeCtrl(cryptoService, tangleidService);

  // mount controllers
  mountIdentifier(apiRouter, identifierCtrl);
  mountCredential(apiRouter, credentialCtrl);
  mountTuring(apiRouter, degreeCtrl);

  rootRouter.use('/api', apiRouter.routes());
  rootRouter.get('/api/publicKey', ctx => {
    ctx.body = cryptoService.getPublicKey();
  });

  app.use(rootRouter.routes());

  return app;
};
