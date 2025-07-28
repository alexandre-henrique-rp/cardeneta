import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ApiService } from "~/api/service";
import { User, UserFormData, userFormSchema } from "../types";
import { MESSAGES, FORM_DEFAULTS, STORAGE_KEYS } from "../constants";

export function useUserSettings(userData: User | null) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const api = ApiService();

  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: FORM_DEFAULTS.USER,
  });

  useEffect(() => {
    if (userData) {
      userForm.reset({
        name: userData.name || "",
        email: userData.email || "",
      });
    }
  }, [userData, userForm]);

  const updateUser = async (values: UserFormData) => {
    try {
      setLoading(true);
      const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
      
      if (!userId) {
        toast.error(MESSAGES.ERROR.USER_NOT_FOUND);
        navigate("/login");
        return;
      }

      await api.UserUpdate(userId, values);
      toast.success(MESSAGES.SUCCESS.USER_UPDATED);
      navigate("/");
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      toast.error(MESSAGES.ERROR.USER_UPDATE_FAILED);
    } finally {
      setLoading(false);
    }
  };

  return {
    userForm,
    loading,
    updateUser,
  };
}