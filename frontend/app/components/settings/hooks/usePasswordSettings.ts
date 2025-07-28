import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ApiService } from "~/api/service";
import { PasswordFormData, passwordFormSchema } from "../types";
import { MESSAGES, FORM_DEFAULTS, STORAGE_KEYS } from "../constants";

export function usePasswordSettings() {
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const api = ApiService();

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: FORM_DEFAULTS.PASSWORD,
  });

  const changePassword = async (values: PasswordFormData) => {
    try {
      setLoading(true);
      const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
      
      if (!userId) {
        toast.error(MESSAGES.ERROR.USER_NOT_FOUND);
        return;
      }

      await api.UserUpdate(userId, { senha: values.newPassword });
      toast.success(MESSAGES.SUCCESS.PASSWORD_CHANGED);
      
      closeModal();
      window.location.reload();
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      toast.error(MESSAGES.ERROR.PASSWORD_CHANGE_FAILED);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => setModalOpen(true);
  
  const closeModal = () => {
    setModalOpen(false);
    passwordForm.reset();
  };

  return {
    passwordForm,
    loading,
    modalOpen,
    changePassword,
    openModal,
    closeModal,
  };
}