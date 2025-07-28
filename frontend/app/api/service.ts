import axios from "axios";

const BaseApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

BaseApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const ApiService = () => ({
  login: async (data: any) => {
    try {
      const response = await BaseApi.post("/auth", data);
      return response.data;
    } catch (error: any) {
      const message = error.response.data.message;
      throw message;
    }
  },
  register: async (data: any) => {
    try {
      const response = await BaseApi.post("/user", data);
      return response.data;
    } catch (error: any) {
      if (error.response.data.message) {
        throw error.response.data.message.join(", ");
      }
      throw error;
    }
  },
  dashboard: async () => {
    try {
      const response = await BaseApi.get("/dashboard");
      return response.data;
    } catch (error: any) {
      if (error.response.data.message) {
        throw error.response.data.message.join(", ");
      }
      throw error;
    }
  },

  // User
  UserId: async (id: string) => {
    const response = await BaseApi.get(`/user/${id}`);
    return response.data;
  },

  // Update User
  UserUpdate: async (id: string, data: any) => {
    try {
      const response = await BaseApi.patch(`/user/${id}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response.data.message) {
        throw error.response.data.message.join(", ");
      }
      throw error;
    }
  },

  // Wallet
  createWallet: async (data: { name: string }) => {
    try {
      const response = await BaseApi.post("/wallet", { name: data.name });
      return response.data;
    } catch (error: any) {
      if (error.response.data.message) {
        throw error.response.data.message;
      }
      throw error;
    }
  },

  getWallet: async (mes: number, ano: number, walletId: string) => {
    try {
      const response = await BaseApi.post(`/wallet/${walletId}`, {ano, mes});
      return response.data;
    } catch (error: any) {
      if (error.response.data.message) {
        throw error.response.data.message;
      }
      throw error;
    }
  },

  // ATM Management
  createAtmCredito: async (data: {
    nome: string;
    value: number;
    walletId: string;
    proofId?: string | null;
    typePayment: string;
    createdPg: Date;
    paymentDueDate?: Date;
    gps: object;
    timezone: string;
  }) => {
    try {
      const response = await BaseApi.post("/credt", data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw error.response.data.message;
      }
      throw error;
    }
  },

  createAtmDebito: async (data: {
    nome: string;
    value: number;
    walletId: string;
    proofId?: string | null;
    typePayment: string;
    createdPg: Date;
    paymentDueDate?: Date;
    gps: object;
    timezone: string;
  }) => {
    try {
      const response = await BaseApi.post("/debit", data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw error.response.data.message;
      }
      throw error;
    }
  },

  getAtm: async (id: string) => {
    try {
      const response = await BaseApi.get(`/atm/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw error.response.data.message;
      }
      throw error;
    }
  },

  updateAtm: async (id: string, data: {
    nome?: string;
    value?: number;
    walletId?: string;
    proofId?: string | null;
    typePayment?: string;
    createdPg?: Date;
    paymentDueDate?: Date;
    gps?: object;
    timezone?: string;
  }) => {
    try {
      const response = await BaseApi.patch(`/atm/${id}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw error.response.data.message;
      }
      throw error;
    }
  },

  deleteAtm: async (id: string) => {
    try {
      const response = await BaseApi.delete(`/atm/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw error.response.data.message;
      }
      throw error;
    }
  },

  // File Upload
  uploadFile: async (formData: FormData) => {
    try {
      const response = await BaseApi.post("/comprovante", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw error.response.data.message;
      }
      throw error;
    }
  },

  // Proof Management
  getProof: async (proofId: string) => {
    try {
      const response = await BaseApi.get(`/proof/${proofId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw error.response.data.message;
      }
      throw error;
    }
  },

  deleteProof: async (proofId: string) => {
    try {
      const response = await BaseApi.delete(`/proof/${proofId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw error.response.data.message;
      }
      throw error;
    }
  },
});
