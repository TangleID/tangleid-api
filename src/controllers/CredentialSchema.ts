import Joi = require('@hapi/joi');

// tslint:disable-next-line:interface-name
export interface CredentialSignParams {
  issuerId: string;
  privateKeyPem: string;

  credentialUri: string;
  credentialIssuanceDate: string;

  subjectId: string;
  degreeName: string;
  degreeSchool: string;
}

export const SIGN_SCHEMA = Joi.object().keys({
  issuerId: Joi.string().required(),
  privateKeyPem: Joi.string().required(),

  credentialUri: Joi.string()
    .required()
    .uri(),

  credentialIssuanceDate: Joi.string()
    .required()
    .isoDate(),

  subjectId: Joi.string().required(),
  degreeName: Joi.string().required(),
  degreeSchool: Joi.string().required(),
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
