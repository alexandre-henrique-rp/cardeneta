import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ApiService } from '../../api/service'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'

export interface User {
  id: string
  email: string
  name: string
  status: boolean
  Wallets: Wallet[]
}

interface Wallet {
  id: string
  name: string
  createdAt: string
}

interface AuthContextType {
  User: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  Logout: () => void
  updateUser: (data: Partial<User>) => Promise<void>;
  handleLoginSuccess: (data: { token: string; expiresAt: number; user: User; }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [User, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const navigate = useNavigate()
  const api = ApiService()

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true)
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      const expiresAt = localStorage.getItem('expiresAt')

      if (expiresAt && new Date().getTime() > new Date(expiresAt).getTime()) {
        Logout()
        setLoading(false)
        navigate({ to: '/login' })
        return
      }

      if (token && userId) {
        try {
          const user = await getUser(userId)
          setUser(user)
          setToken(token)
        } catch (error) {
          Logout()
          navigate({ to: '/login' })
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const handleLoginSuccess = (data: {
    token: string
    expiresAt: number
    user: User
  }) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('userId', data.user.id)
    localStorage.setItem('expiresAt', data.expiresAt.toString())

    // Verifica se existem carteiras antes de acessar
    if (data.user.Wallets && data.user.Wallets.length > 0) {
      localStorage.setItem('currentWallet', data.user.Wallets[0].id)
    } else {
      localStorage.removeItem('currentWallet')
    }

    localStorage.setItem(
      'wallets',
      data.user.Wallets && data.user.Wallets.length > 0
        ? JSON.stringify(data.user.Wallets)
        : JSON.stringify([])
    )
    setUser(data.user)
    setToken(data.token)
  }

  const Logout = () => {
    console.log('Logout')
    setToken(null)
    setUser(null)
    localStorage.clear()
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const data = await api.login({ email, senha: password })
      if (data.user.status === true) {
        handleLoginSuccess(data)
        toast.success('Login realizado com sucesso!')
        navigate({ to: '/' })
      } else {
        toast.error('Usuário desativado!')
      }
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao fazer login')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: {
    email: string
    password: string
    name: string
  }) => {
    try {
      setLoading(true)
      await api.register(data)
      toast.success(
        'Cadastro realizado com sucesso! Faça login para continuar.'
      )
      navigate({ to: '/login' })
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao cadastrar')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (data: Partial<User>) => {
    if (!User) return

    try {
      setLoading(true)
      const updatedUser = await api.UserUpdate(User.id, data)
      setUser(updatedUser)
      toast.success('Dados atualizados com sucesso!')
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao atualizar dados')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getUser = async (id: string) => {
    try {
      setLoading(true)
      const userData = await api.UserId(id)
      localStorage.setItem('wallets', JSON.stringify(userData.Wallets))
      return userData
    } catch (error: any) {
      toast.error(error.message || 'Erro ao buscar dados do usuário')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    User,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    Logout,
    updateUser,
    handleLoginSuccess,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
