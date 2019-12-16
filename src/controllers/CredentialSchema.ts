import Joi = require('@hapi/joi');

// tslint:disable-next-line:interface-name
export interface CredentialSignParams {
  privateKeyPem: string;

  uri: string;

  issuer: string;
  issuanceDate: string;

  subject: string;
}

export const SIGN_SCHEMA = Joi.object().keys({
  privateKeyPem: Joi.string().required(),

  uri: Joi.string()
    .required()
    .uri(),

  issuer: Joi.string().required(),
  issuanceDate: Joi.string()
    .required()
    .isoDate(),

  subject: Joi.string().required(),
});

// tslint:disable-next-line:interface-name
export interface CredentialVerifyParams {
  credential: string;
}

const VERIFY_SCHEMA = Joi.object().keys({
  credential: Joi.string().required(),
});

export class CredentialSchema {
  public validateSignBody(body: any) {
    const params = body as CredentialSignParams;
    const result = Joi.validate(params, SIGN_SCHEMA);

    return result;
  }

  public validateVerifyBody(body: any) {
    const params = body as CredentialVerifyParams;
    const result = Joi.validate(params, VERIFY_SCHEMA);

    return result;
  }
}
