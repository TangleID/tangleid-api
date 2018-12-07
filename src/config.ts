import * as dotenv from 'dotenv';

dotenv.config();
let envPath;
switch (process.env.NODE_ENV) {
  case 'production':
    envPath = `${__dirname}/../.env.production`;
    break;
  default:
    envPath = `${__dirname}/../.env`;
}
dotenv.config({ path: envPath });

export const TANGLEID_IRI =
  process.env.TANGLEID_IRI || 'http://node.deviceproof.org:14265';
