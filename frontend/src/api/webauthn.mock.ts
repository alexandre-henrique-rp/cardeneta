/**
 * @file webauthn.mock.ts
 * @description Simula as respostas do backend para a API WebAuthn.
 * ATENÇÃO: Este arquivo é apenas para fins de desenvolvimento e teste do frontend.
 * Os dados aqui são fixos e não devem ser usados em produção.
 */
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/types'

/**
 * Simula a geração de um desafio de registro pelo servidor.
 * Em um cenário real, este desafio seria único para cada solicitação.
 */
export const mockRegistrationChallenge: PublicKeyCredentialCreationOptionsJSON = {
  challenge: 'bW9ja19jaGFsbGVuZ2VfMTIzNDU2Nzg5MEFCQ0RFRg',
  rp: {
    name: 'Cardeneta App',
    id: 'localhost',
  },
  user: {
    id: 'bW9ja191c2VyX2lkX0FCQzEyMw',
    name: 'usuario@teste.com',
    displayName: 'Usuário de Teste',
  },
  pubKeyCredParams: [
    { type: 'public-key', alg: -7 }, // ES256
    { type: 'public-key', alg: -257 }, // RS256
  ],
  authenticatorSelection: {
    authenticatorAttachment: 'platform', // Requer biometria do dispositivo
    userVerification: 'required',
    requireResidentKey: true,
  },
  timeout: 60000,
  attestation: 'direct',
}

/**
 * Simula a geração de um desafio de login pelo servidor.
 */
export const mockLoginChallenge: PublicKeyCredentialRequestOptionsJSON = {
  challenge: 'bW9ja19sb2dpbl9jaGFsbGVuZ2VfRkVEQ0JBMDA4NzY1NDMyMQ',
  allowCredentials: [
    {
      type: 'public-key',
      id: 'bW9ja19jcmVkZW50aWFsX2lk',
      transports: ['internal'],
    },
  ],
  userVerification: 'required',
  rpId: 'localhost',
}
