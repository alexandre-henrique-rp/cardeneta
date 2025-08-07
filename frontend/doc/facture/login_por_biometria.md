# Guia de Implementação: Login por Biometria (WebAuthn)

Este documento detalha o plano e a arquitetura para implementar um sistema de login biométrico (usando Passkeys/WebAuthn) no aplicativo. A implementação seguirá a arquitetura Clean já estabelecida no projeto, garantindo coesão e manutenibilidade.

## 1. Visão Geral e Regras de Negócio

A funcionalidade de login biométrico visa aprimorar a experiência do usuário, oferecendo um método de autenticação rápido e seguro, sem a necessidade de senhas.

### Regras Principais:

1.  **Ativação Condicional**: O login biométrico só será oferecido e ativado se o aplicativo estiver instalado como PWA.
    -   **Detecção**: Utilizar `window.matchMedia('(display-mode: standalone)').matches` para verificar o modo de exibição.
2.  **Primeiro Acesso**: O primeiro login de um usuário no sistema **sempre** será realizado através de email e senha.
3.  **Registro Biométrico (Onboarding)**: Após o primeiro login e com o PWA instalado, o usuário será convidado a registrar seu dispositivo para login biométrico.
4.  **Login Subsequente**: Uma vez registrado, o usuário poderá autenticar-se usando a biometria do dispositivo (Face ID, Touch ID, etc.) em acessos futuros.

## 2. Arquitetura e Integração

A implementação será dividida entre o Frontend e o Backend, seguindo a arquitetura Clean.

### Frontend (`src/`)
-   **Camada de Apresentação (Presentation)**: Modificaremos a página de login (`src/routes/_public/login.tsx`) e criaremos componentes para o registro biométrico.
-   **Camada de Aplicação (Application)**: Criaremos hooks customizados (ex: `useWebAuthn`) para encapsular a lógica da API WebAuthn.
-   **Camada de Infraestrutura (Infrastructure)**: Criaremos um serviço (`src/api/webauthn.ts`) para se comunicar com os novos endpoints do backend.

### Backend
-   O backend precisará de novos endpoints para gerenciar o ciclo de vida das credenciais WebAuthn:
    1.  `/auth/webauthn/register-challenge`: Gera um desafio para o registro de uma nova credencial.
    2.  `/auth/webauthn/register-verify`: Verifica a resposta do cliente e salva a chave pública.
    3.  `/auth/webauthn/login-challenge`: Gera um desafio para a autenticação.
    4.  `/auth/webauthn/login-verify`: Verifica a assinatura e autentica o usuário, gerando um JWT.

## 3. Recursos e Documentação

-   **Guia Oficial WebAuthn**: [webauthn.guide](https://webauthn.guide/)
-   **Documentação MDN**: [Web Authentication API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API)
-   **Biblioteca Auxiliar (Recomendada)**: [SimpleWebAuthn](https://simplewebauthn.dev/) - Simplifica a interação com a API WebAuthn tanto no cliente quanto no servidor.
-   **Exemplo com React**: [GitHub - passkeys-react-example](https://github.com/MasterKale/passkeys-react-example)

## 4. Passo a Passo da Implementação (Frontend)

### 4.1. Instalação de Dependências

Para simplificar a interação com a API WebAuthn, instalaremos a biblioteca `simplewebauthn`.

```bash
npm install @simplewebauthn/browser @simplewebauthn/typescript-types
# ou
yarn add @simplewebauthn/browser @simplewebauthn/typescript-types
```

### 4.2. Camada de Infraestrutura: Serviço API

Criaremos um arquivo para centralizar as chamadas à API relacionadas ao WebAuthn.

**Arquivo**: `src/api/webauthn.ts`

```typescript
import { apiClient } from './api-client'; // Supondo que você tenha um cliente de API
import type { 
  GenerateRegistrationOptionsOpts, 
  GenerateAuthenticationOptionsOpts, 
  VerifiedRegistrationResponse,
  VerifiedAuthenticationResponse
} from '@simplewebauthn/typescript-types';

// Tipos para as respostas da nossa API
interface RegistrationChallengeResponse {
  options: GenerateRegistrationOptionsOpts;
}

interface AuthenticationChallengeResponse {
  options: GenerateAuthenticationOptionsOpts;
}

/**
 * Busca as opções de desafio para registro de uma nova credencial WebAuthn.
 */
export const getRegistrationChallenge = async (): Promise<RegistrationChallengeResponse> => {
  const { data } = await apiClient.get('/auth/webauthn/register-challenge');
  return data;
};

/**
 * Envia a resposta do cliente para verificação do registro.
 * @param body - A resposta da API do navegador após o usuário interagir.
 */
export const verifyRegistration = async (body: VerifiedRegistrationResponse): Promise<void> => {
  await apiClient.post('/auth/webauthn/register-verify', body);
};

/**
 * Busca as opções de desafio para autenticação com uma credencial existente.
 */
export const getLoginChallenge = async (): Promise<AuthenticationChallengeResponse> => {
  const { data } = await apiClient.get('/auth/webauthn/login-challenge');
  return data;
};

/**
 * Envia a resposta do cliente para verificação da autenticação.
 * @param body - A resposta da API do navegador após o usuário interagir.
 */
export const verifyLogin = async (body: VerifiedAuthenticationResponse): Promise<{ token: string }> => {
  const { data } = await apiClient.post('/auth/webauthn/login-verify', body);
  return data;
};
```

### 4.3. Camada de Aplicação: Hook `useWebAuthn`

Este hook irá abstrair toda a complexidade do fluxo WebAuthn.

**Arquivo**: `src/hooks/useWebAuthn.ts`

```typescript
import { useState } from 'react';
import { 
  startRegistration, 
  startAuthentication 
} from '@simplewebauthn/browser';
import * as webAuthnApi from '@/api/webauthn';

export function useWebAuthn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPwaMode = () => window.matchMedia('(display-mode: standalone)').matches;

  /**
   * Inicia o processo de registro de uma nova credencial biométrica.
   */
  const register = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const challenge = await webAuthnApi.getRegistrationChallenge();
      const registrationResponse = await startRegistration(challenge.options);
      await webAuthnApi.verifyRegistration(registrationResponse);
      // Exibir sucesso para o usuário
    } catch (err) {
      setError('Falha ao registrar biometria. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Inicia o processo de login com biometria.
   */
  const login = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const challenge = await webAuthnApi.getLoginChallenge();
      const authResponse = await startAuthentication(challenge.options);
      const { token } = await webAuthnApi.verifyLogin(authResponse);
      // Salvar token e redirecionar usuário
      return token;
    } catch (err) {
      setError('Falha no login com biometria.');
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { register, login, isLoading, error, isPwaMode };
}
```

### 4.4. Camada de Apresentação: Página de Login

Finalmente, integramos o hook na página de login.

**Arquivo**: `src/routes/_public/login.tsx` (exemplo de integração)

```tsx
import { Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import { useEffect, useState } from 'react';

// ... dentro do componente da página de login

const { login: loginWithBiometrics, isPwaMode } = useWebAuthn();
const [showBiometricButton, setShowBiometricButton] = useState(false);

useEffect(() => {
  // Verifica se o PWA está instalado e se o navegador suporta WebAuthn
  if (isPwaMode() && window.PublicKeyCredential) {
    setShowBiometricButton(true);
  }
}, [isPwaMode]);

const handleBiometricLogin = async () => {
  const token = await loginWithBiometrics();
  if (token) {
    // Lógica de sucesso (ex: salvar token no contexto de autenticação e redirecionar)
  }
};

// ... no JSX do formulário

{
  showBiometricButton && (
    <Button variant="outline" type="button" onClick={handleBiometricLogin}>
      <Fingerprint className="mr-2 h-4 w-4" />
      Entrar com Biometria
    </Button>
  )
}
```

### 4.5. Componente para Registro Biométrico

Após o primeiro login, podemos usar um `AlertDialog` do Shadcn UI para convidar o usuário a registrar a biometria.

**Exemplo de componente**: `src/components/auth/BiometricOnboardingDialog.tsx`

```tsx
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { useWebAuthn } from '@/hooks/useWebAuthn';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BiometricOnboardingDialog({ open, onOpenChange }: Props) {
  const { register, isLoading } = useWebAuthn();

  const handleRegister = async () => {
    await register();
    onOpenChange(false); // Fecha o dialog após a tentativa
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Login mais rápido?</AlertDialogTitle>
          <AlertDialogDescription>
            Ative o login por biometria (Face ID, digital) para acessar sua conta de forma segura e sem senhas neste dispositivo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Agora não</AlertDialogCancel>
          <AlertDialogAction onClick={handleRegister} disabled={isLoading}>
            {isLoading ? 'Aguarde...' : 'Ativar Biometria'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```
