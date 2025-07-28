import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { User } from "./types";
import { AddWalletModal } from "./AddWalletModal";
import { useWalletSettings } from "./hooks/useWalletSettings";

interface WalletsSectionProps {
  userData: User | null;
}

export function WalletsSection({ userData }: WalletsSectionProps) {
  const { modalOpen, openModal, closeModal, walletForm, loading, addWallet } = useWalletSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Carteiras</h2>
        <Dialog open={modalOpen} onOpenChange={closeModal}>
          <DialogTrigger asChild>
            <Button onClick={openModal}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Carteira
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Carteira</DialogTitle>
            </DialogHeader>
            <AddWalletModal
              form={walletForm}
              loading={loading}
              onSubmit={addWallet}
              onCancel={closeModal}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID da Carteira</TableHead>
              <TableHead>Nome da Carteira</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userData?.Wallets?.map((wallet) => (
              <TableRow key={wallet.id}>
                <TableCell className="font-mono">{wallet.id}</TableCell>
                <TableCell>{wallet.name || "Carteira Principal"}</TableCell>
              </TableRow>
            ))}
            {(!userData?.Wallets || userData.Wallets.length === 0) && (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  Nenhuma carteira encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}