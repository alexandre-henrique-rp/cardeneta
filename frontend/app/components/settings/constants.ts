export const MESSAGES = {
  SUCCESS: {
    USER_UPDATED: "Dados atualizados com sucesso!",
    WALLET_ADDED: "Carteira adicionada com sucesso!",
    PASSWORD_CHANGED: "Senha alterada com sucesso!",
  },
  ERROR: {
    USER_UPDATE_FAILED: "Erro ao atualizar dados",
    WALLET_ADD_FAILED: "Erro ao adicionar carteira",
    PASSWORD_CHANGE_FAILED: "Erro ao alterar senha",
    USER_NOT_FOUND: "Usuário não encontrado",
    LOAD_USER_FAILED: "Erro ao carregar dados do usuário",
  },
} as const;

export const FORM_DEFAULTS = {
  USER: {
    name: "",
    email: "",
  },
  WALLET: {
    NewWalletId: "",
  },
  PASSWORD: {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  },
} as const;

export const STORAGE_KEYS = {
  USER_ID: "userId",
} as const;