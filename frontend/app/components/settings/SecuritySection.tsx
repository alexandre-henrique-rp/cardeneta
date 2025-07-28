import { Key } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { usePasswordSettings } from "./hooks/usePasswordSettings";

export function SecuritySection() {
  const { modalOpen, openModal, closeModal, passwordForm, loading, changePassword } = usePasswordSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Segurança</h2>
        <Dialog open={modalOpen} onOpenChange={closeModal}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={openModal}>
              <Key className="mr-2 h-4 w-4" />
              Redefinir Senha
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Redefinir Senha</DialogTitle>
            </DialogHeader>
            <ChangePasswordModal
              form={passwordForm}
              loading={loading}
              onSubmit={changePassword}
              onCancel={closeModal}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}