import Joi = require('@hapi/joi');

// tslint:disable-next-line:interface-name
export interface CredentialSignParams {
  issuer: string;
  privateKey: string;
  sessionKey: string;
  iv: string;

  ipfs: string;
  timestamp: string;

  holder: string;
  type: string;
  issuerName: string;
}

export const SIGN_SCHEMA = Joi.object().keys({
  issuer: Joi.string().required(),
  privateKey: Joi.string().required(),
  sessionKey: Joi.string().required(),
  iv: Joi.string().required(),

  ipfs: Joi.string()
    .required()
    .uri(),

  timestamp: Joi.string()
    .required()
    .isoDate(),

  holder: Joi.string().required(),
  type: Joi.string().required(),
  issuerName: Joi.string().required(),
});

// tslint:disable-next-line:interface-name
export interface CredentialVerifyParams {
  credential: string;
}

const VERIFY_SCHEMA = Joi.object().keys({
  credential: Joi.string().required(),
});

export const validateSignBody = (body: any) => {
  const params = body as CredentialSignParams;
  const result = Joi.validate(params, SIGN_SCHEMA);

  return result;
};

export const validateVerifyBody = (body: any) => {
  const params = body as CredentialVerifyParams;
  const result = Joi.validate(params, VERIFY_SCHEMA);

  return result;
};
