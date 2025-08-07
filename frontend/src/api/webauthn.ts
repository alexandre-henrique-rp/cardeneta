import { BaseApi } from './service'
import {
  mockLoginChallenge,
  mockRegistrationChallenge,
} from './webauthn.mock'
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/types'
import type { User } from '@/context/auth'

/**
 * Busca as opções de desafio para registro de uma nova credencial WebAuthn.
 * Essas opções são então passadas para a API WebAuthn do navegador.
 */
export const getRegistrationChallenge =
  async (): Promise<PublicKeyCredentialCreationOptionsJSON> => {
    if (import.meta.env.DEV) {
      console.log('MOCKING: getRegistrationChallenge')
      return Promise.resolve(mockRegistrationChallenge)
    }
    const { data } = await BaseApi.get('/auth/webauthn/register-challenge')
    return data
  }

/**
 * Envia a resposta de registro do cliente para o servidor para verificação.
 * @param body - A resposta da API do navegador startRegistration().
 */
export const verifyRegistration = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  body: RegistrationResponseJSON
): Promise<void> => {
  if (import.meta.env.DEV) {
    console.log('MOCKING: verifyRegistration', body)
    return Promise.resolve()
  }
  await BaseApi.post('/auth/webauthn/register-verify', body)
}

/**
 * Busca as opções de desafio para autenticação do servidor.
 * Essas opções são então passadas para a API WebAuthn do navegador.
 */
export const getLoginChallenge =
  async (): Promise<PublicKeyCredentialRequestOptionsJSON> => {
    if (import.meta.env.DEV) {
      console.log('MOCKING: getLoginChallenge')
      return Promise.resolve(mockLoginChallenge)
    }
    const { data } = await BaseApi.get('/auth/webauthn/login-challenge')
    return data
  }

/**
 * Envia a resposta de autenticação do cliente para o servidor para verificação.
 * @param body - A resposta da API do navegador startAuthentication().
 */
export const verifyLogin = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  body: AuthenticationResponseJSON
): Promise<{ token: string; user: User; expiresAt: number }> => {
  if (import.meta.env.DEV) {
    console.log('MOCKING: verifyLogin', body)
    const mockUser: User = {
      id: 'mock-user-id',
      name: 'Usuário Mock',
      email: 'mock@example.com',
      status: true,
      Wallets: [],
    }
    return Promise.resolve({
      token: 'mock-jwt-token',
      user: mockUser,
      expiresAt: Date.now() + 3600 * 1000, // Expira em 1 hora
    })
  }
  const { data } = await BaseApi.post('/auth/webauthn/login-verify', body)
  return data
}
