import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useWebAuthn } from '@/hooks/useWebAuthn'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Componente de diálogo para convidar o usuário a registrar a biometria.
 * Aparece após o primeiro login se o app for um PWA.
 */
export function BiometricOnboardingDialog({ open, onOpenChange }: Props) {
  const { register, isLoading } = useWebAuthn()

  const handleRegister = async () => {
    const success = await register()

    if (success) {
      toast.success('Biometria ativada com sucesso!')
      onOpenChange(false) // Fecha o dialog após o sucesso
    } else {
      // A mensagem de erro já é exibida pelo hook, mas podemos adicionar um toast se quisermos.
      toast.error('Não foi possível ativar a biometria.')
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Login mais rápido?</AlertDialogTitle>
          <AlertDialogDescription>
            Ative o login por biometria (Face ID, digital) para acessar sua
            conta de forma segura e sem senhas neste dispositivo.
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
  )
}
