import { z } from "zod";

export interface User {
  id: string;
  name: string;
  email: string;
  Wallets: Wallet[];
}

export interface Wallet {
  id: string;
  name: string;
}

export const userFormSchema = z.object({
  name: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres.",
  }),
  email: z.string().min(3, {
    message: "O email deve ter pelo menos 3 caracteres.",
  }).email({
    message: "Digite um email válido.",
  }),
});

export const walletFormSchema = z.object({
  NewWalletId: z.string().min(1, {
    message: "O código da carteira é obrigatório.",
  }),
});

export const passwordFormSchema = z.object({
  oldPassword: z.string().min(1, {
    message: "A senha atual é obrigatória.",
  }),
  newPassword: z.string().min(6, {
    message: "A nova senha deve ter pelo menos 6 caracteres.",
  }),
  confirmPassword: z.string().min(1, {
    message: "A confirmação da senha é obrigatória.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

export type UserFormData = z.infer<typeof userFormSchema>;
export type WalletFormData = z.infer<typeof walletFormSchema>;
export type PasswordFormData = z.infer<typeof passwordFormSchema>;