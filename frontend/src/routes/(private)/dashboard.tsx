import { useEffect, useState } from 'react';
import HomeComponent from '@/components/home-component';
import { BiometricOnboardingDialog } from '@/components/auth/BiometricOnboardingDialog';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(private)/dashboard')({
  component: App,
})

function App() {
  const [showOnboardingDialog, setShowOnboardingDialog] = useState(false);
  const { isPwaMode, hasBiometricRegistration } = useWebAuthn();

  useEffect(() => {
    // Exibe o diálogo se estiver no modo PWA e a biometria ainda não foi registrada.
    if (isPwaMode() && !hasBiometricRegistration()) {
      setShowOnboardingDialog(true);
    }
  }, [isPwaMode, hasBiometricRegistration]);

  return (
    <>
      <HomeComponent />
      <BiometricOnboardingDialog
        open={showOnboardingDialog}
        onOpenChange={setShowOnboardingDialog}
      />
    </>
  );
}
