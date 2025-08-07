import { BaseApi } from './service'
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
    const { data } = await BaseApi.get('/auth/webauthn/register-challenge')
    return data
  }

/**
 * Envia a resposta de registro do cliente para o servidor para verificação.
 * @param body - A resposta da API do navegador startRegistration().
 */
export const verifyRegistration = async (
  body: RegistrationResponseJSON
): Promise<void> => {
  await BaseApi.post('/auth/webauthn/register-verify', body)
}

/**
 * Busca as opções de desafio para autenticação do servidor.
 * Essas opções são então passadas para a API WebAuthn do navegador.
 */
export const getLoginChallenge =
  async (): Promise<PublicKeyCredentialRequestOptionsJSON> => {
    const { data } = await BaseApi.get('/auth/webauthn/login-challenge')
    return data
  }

/**
 * Envia a resposta de autenticação do cliente para o servidor para verificação.
 * @param body - A resposta da API do navegador startAuthentication().
 */
export const verifyLogin = async (
  body: AuthenticationResponseJSON
): Promise<{ token: string; user: User; expiresAt: number }> => {
  const { data } = await BaseApi.post('/auth/webauthn/login-verify', body)
  return data
}
