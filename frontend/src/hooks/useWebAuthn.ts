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
      // Verifica se o navegador suporta WebAuthn
      if (!window.PublicKeyCredential) {
        setError('Seu navegador não suporta autenticação biométrica.')
        return false
      }

      // Verifica se autenticadores de plataforma estão disponíveis
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      if (!available) {
        setError('Biometria não está disponível neste dispositivo.')
        return false
      }

      const challengeResponse = await webAuthnApi.getRegistrationChallenge()
      const registrationResponse = await startRegistration({
        optionsJSON: challengeResponse,
      })
      await webAuthnApi.verifyRegistration(registrationResponse)
      localStorage.setItem(BIOMETRIC_REGISTERED_KEY, 'true')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      
      if (errorMessage.includes('NotAllowedError') || errorMessage.includes('cancelled')) {
        setError('Registro cancelado pelo usuário.')
      } else if (errorMessage.includes('NotSupportedError')) {
        setError('Autenticação biométrica não é suportada neste dispositivo.')
      } else {
        setError('Falha ao registrar biometria. Verifique se o dispositivo suporta biometria.')
      }
      
      console.error('Erro ao registrar biometria:', err)
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
      // Verifica se o navegador suporta WebAuthn
      if (!window.PublicKeyCredential) {
        setError('Seu navegador não suporta autenticação biométrica.')
        return null
      }

      const challengeResponse = await webAuthnApi.getLoginChallenge()
      const authResponse = await startAuthentication({
        optionsJSON: challengeResponse,
      })
      const { token, user, expiresAt } =
        await webAuthnApi.verifyLogin(authResponse)
      return { token, user, expiresAt }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      
      if (errorMessage.includes('NotAllowedError') || errorMessage.includes('cancelled')) {
        setError('Login cancelado pelo usuário.')
      } else if (errorMessage.includes('InvalidStateError')) {
        setError('Credencial biométrica não encontrada. Registre novamente.')
      } else {
        setError('Falha no login com biometria. Tente novamente.')
      }
      
      console.error('Erro no login biométrico:', err)
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
