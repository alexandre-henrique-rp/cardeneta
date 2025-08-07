import { useCallback, useState } from 'react'
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'
import * as webAuthnApi from '@/api/webauthn'
import type { User } from '@/context/auth'

/**
 * Hook customizado para encapsular a lógica de autenticação WebAuthn.
 * Fornece funções para registrar uma nova credencial e para realizar login,
 * além de gerenciar estados de carregamento e erro.
 */
const BIOMETRIC_REGISTERED_KEY = 'biometric_registered'

export function useWebAuthn() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Verifica se o aplicativo está rodando em modo PWA (standalone).
   * @returns {boolean} True se estiver em modo PWA.
   */
  const isPwaMode = useCallback(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(display-mode: standalone)').matches
    }
    return false
  }, [])

  /**
   * Inicia o processo de registro de uma nova credencial biométrica.
   */
  const register = async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const challengeResponse = await webAuthnApi.getRegistrationChallenge()
      const registrationResponse = await startRegistration({
        optionsJSON: challengeResponse,
      })
      await webAuthnApi.verifyRegistration(registrationResponse)
      localStorage.setItem(BIOMETRIC_REGISTERED_KEY, 'true') // Marca como registrado
      return true
    } catch (err) {
      setError('Falha ao registrar biometria. Tente novamente.')
      console.error(err)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Inicia o processo de login com biometria.
   * @returns {Promise<{ token: string; user: User; expiresAt: number } | null>} O token de autenticação em caso de sucesso, ou null em caso de falha.
   */
  const login = async (): Promise<{
    token: string
    user: User
    expiresAt: number
  } | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const challengeResponse = await webAuthnApi.getLoginChallenge()
      const authResponse = await startAuthentication({
        optionsJSON: challengeResponse,
      })
      const { token, user, expiresAt } =
        await webAuthnApi.verifyLogin(authResponse)
      // O token será retornado para ser gerenciado pelo contexto de autenticação
      return { token, user, expiresAt }
    } catch (err) {
      setError('Falha no login com biometria.')
      console.error(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    register,
    login,
    isLoading,
    error,
    isPwaMode,
    hasBiometricRegistration: useCallback(
    () => !!localStorage.getItem(BIOMETRIC_REGISTERED_KEY),
    [],
  ),
  }
}
