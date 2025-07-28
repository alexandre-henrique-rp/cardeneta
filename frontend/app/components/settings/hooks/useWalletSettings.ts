import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ApiService } from "~/api/service";
import { WalletFormData, walletFormSchema } from "../types";
import { MESSAGES, FORM_DEFAULTS, STORAGE_KEYS } from "../constants";

export function useWalletSettings() {
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const api = ApiService();

  const walletForm = useForm<WalletFormData>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: FORM_DEFAULTS.WALLET,
  });

  const addWallet = async (values: WalletFormData) => {
    try {
      setLoading(true);
      const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
      
      if (!userId) {
        toast.error(MESSAGES.ERROR.USER_NOT_FOUND);
        return;
      }

      await api.UserUpdate(userId, { NewWalletId: values.NewWalletId });
      toast.success(MESSAGES.SUCCESS.WALLET_ADDED);
      
      closeModal();
      window.location.reload();
    } catch (error) {
      console.error("Erro ao adicionar carteira:", error);
      toast.error(MESSAGES.ERROR.WALLET_ADD_FAILED);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => setModalOpen(true);
  
  const closeModal = () => {
    setModalOpen(false);
    walletForm.reset();
  };

  return {
    walletForm,
    loading,
    modalOpen,
    addWallet,
    openModal,
    closeModal,
  };
}