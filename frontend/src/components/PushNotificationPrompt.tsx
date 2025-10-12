import { useEffect, useState } from 'react';
import { usePushNotification } from '../hooks/usePushNotification';
import { IconBell, IconBellOff, IconX } from '@tabler/icons-react';

/**
 * Componente para solicitar permissão de notificações push
 * Exibe um prompt para o usuário ativar notificações quando o PWA estiver instalado
 */
export const PushNotificationPrompt = () => {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
  } = usePushNotification();

  const [showPrompt, setShowPrompt] = useState(false);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);

  /**
   * Verifica se o PWA está instalado
   */
  useEffect(() => {
    const checkPWAInstalled = () => {
      const isInstalled =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsPWAInstalled(isInstalled);
    };

    checkPWAInstalled();
  }, []);

  /**
   * Exibe o prompt se o PWA estiver instalado e o usuário ainda não estiver inscrito
   */
  useEffect(() => {
    if (isPWAInstalled && isSupported && !isSubscribed && permission === 'default') {
      // Verificar se o usuário já fechou o prompt anteriormente
      const promptClosed = localStorage.getItem('pushNotificationPromptClosed');
      if (!promptClosed) {
        setShowPrompt(true);
      }
    }
  }, [isPWAInstalled, isSupported, isSubscribed, permission]);

  /**
   * Fecha o prompt e salva a preferência do usuário
   */
  const handleClose = () => {
    setShowPrompt(false);
    localStorage.setItem('pushNotificationPromptClosed', 'true');
  };

  /**
   * Ativa as notificações
   */
  const handleEnable = async () => {
    const success = await subscribe();
    if (success) {
      setShowPrompt(false);
    }
  };

  // Não renderizar se não houver suporte ou se o prompt não deve ser exibido
  if (!isSupported || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <IconBell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            Ativar Notificações
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Receba notificações sobre novos registros em suas carteiras.
          </p>

          {error && (
            <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleEnable}
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-medium rounded transition-colors"
            >
              {isLoading ? 'Ativando...' : 'Ativar'}
            </button>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium rounded transition-colors"
            >
              Agora não
            </button>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <IconX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/**
 * Componente para gerenciar notificações nas configurações
 */
export const PushNotificationSettings = () => {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotification();

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Notificações push não são suportadas neste navegador.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isSubscribed ? (
            <IconBell className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <IconBellOff className="w-5 h-5 text-gray-400" />
          )}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Notificações Push
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {isSubscribed
                ? 'Você receberá notificações sobre novos registros'
                : 'Ative para receber notificações'}
            </p>
          </div>
        </div>

        <button
          onClick={isSubscribed ? unsubscribe : subscribe}
          disabled={isLoading || permission === 'denied'}
          className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
            isSubscribed
              ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white'
              : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white'
          }`}
        >
          {isLoading
            ? 'Processando...'
            : isSubscribed
              ? 'Desativar'
              : 'Ativar'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {permission === 'denied' && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm text-yellow-800 dark:text-yellow-200">
          Você bloqueou as notificações. Para ativar, altere as configurações do
          navegador.
        </div>
      )}
    </div>
  );
};
