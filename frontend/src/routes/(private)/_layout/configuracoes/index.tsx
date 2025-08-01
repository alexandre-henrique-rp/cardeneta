import {
  createFileRoute,
  redirect,
  useLoaderData,
} from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2, Plus, Key } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { ApiService } from '@/api/service'

export const Route = createFileRoute('/(private)/_layout/configuracoes/')({
  loader: async () => {
    const api = ApiService()
    const userId = localStorage.getItem('userId')

    // A forma correta de redirecionar
    if (!userId) {
      // Lançar o redirect interrompe a execução e redireciona com segurança
      throw redirect({
        to: '/login',
      })
    }

    // O restante do seu código está ótimo!
    const userData = await api.UserId(userId)
    return userData
  },
  head: () => ({
    meta: [
      {
        title: 'CadernetaApp | Configurações',
        description: 'Configurações do usuário',
      },
    ],
  }),
  component: RouteComponent, // Seu componente que vai usar os dados
})

const userFormSchema = z.object({
  name: z.string().min(3, {
    message: 'O nome deve ter pelo menos 3 caracteres.',
  }),
  email: z
    .string()
    .min(3, {
      message: 'O email deve ter pelo menos 3 caracteres.',
    })
    .email({
      message: 'Digite um email válido.',
    }),
})

const walletFormSchema = z.object({
  NewWalletId: z.string().min(1, {
    message: 'O código da carteira é obrigatório.',
  }),
})

const passwordFormSchema = z
  .object({
    oldPassword: z.string().min(1, {
      message: 'A senha atual é obrigatória.',
    }),
    newPassword: z.string().min(6, {
      message: 'A nova senha deve ter pelo menos 6 caracteres.',
    }),
    confirmPassword: z.string().min(1, {
      message: 'A confirmação da senha é obrigatória.',
    }),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

interface UserData {
  name: string
  email: string
  Wallets: string
}

function RouteComponent() {
  const [loading, setLoading] = useState(false)
  const userData = useLoaderData<UserData | any>({
    from: '/(private)/_layout/configuracoes/',
  })
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const navigate = useNavigate()
  const api = ApiService()

  useEffect(() => {
    if (userData) {
      userForm.reset({
        name: userData.name,
        email: userData.email,
      })
    }
  }, [userData])

  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  })

  const walletForm = useForm<z.infer<typeof walletFormSchema>>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: {
      NewWalletId: '',
    },
  })

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onUserSubmit = async (values: z.infer<typeof userFormSchema>) => {
    try {
      setLoading(true)
      const userId = localStorage.getItem('userId')
      if (!userId) {
        toast.error('Usuário não encontrado')
        navigate({ to: '/login' })
        return
      }
      await api.UserUpdate(userId, values)
      toast.success('Dados atualizados com sucesso!')
      navigate({ to: '/' })
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      toast.error('Erro ao atualizar dados')
    } finally {
      setLoading(false)
    }
  }

  const onWalletSubmit = async (values: z.infer<typeof walletFormSchema>) => {
    try {
      setLoading(true)
      const userId = localStorage.getItem('userId')
      if (!userId) return

      await api.UserUpdate(userId, { NewWalletId: values.NewWalletId })
      toast.success('Carteira adicionada com sucesso!')
      setWalletModalOpen(false)
      walletForm.reset()
      window.location.reload()
    } catch (error) {
      console.error('Erro ao adicionar carteira:', error)
      toast.error('Erro ao adicionar carteira')
    } finally {
      setLoading(false)
    }
  }

  const onPasswordSubmit = async (
    values: z.infer<typeof passwordFormSchema>
  ) => {
    try {
      setLoading(true)
      const userId = localStorage.getItem('userId')
      if (!userId) return

      await api.UserUpdate(userId, { senha: values.newPassword })
      toast.success('Senha alterada com sucesso!')
      setPasswordModalOpen(false)
      passwordForm.reset()
      window.location.reload()
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      toast.error('Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  // Se não há dados do usuário, mostre uma mensagem de carregamento ou erro
  if (!userData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Configurações</h1>
              <p className="text-muted-foreground">
                Carregando dados do usuário...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Configurações</h1>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais
            </p>
          </div>

          <div className="space-y-8">
            {/* Formulário do Usuário */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Informações Pessoais</h2>
              <Form {...userForm}>
                <div className="space-y-6">
                  <FormField
                    control={userForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={userForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="seu@email.com"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
            </div>

            {/* Seção de Carteiras */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Carteiras</h2>
                <Dialog
                  open={walletModalOpen}
                  onOpenChange={setWalletModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Carteira
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Nova Carteira</DialogTitle>
                    </DialogHeader>
                    <Form {...walletForm}>
                      <form
                        onSubmit={walletForm.handleSubmit(onWalletSubmit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={walletForm.control}
                          name="NewWalletId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Código da Carteira</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Digite o código da carteira"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setWalletModalOpen(false)
                              walletForm.reset()
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1"
                            disabled={loading}
                          >
                            {loading && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Salvar
                          </Button>
                        </div>
                      </form>
                    </Form>
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
                    {userData?.Wallets?.map((wallet: any) => (
                      <TableRow key={wallet.id}>
                        <TableCell className="font-mono">{wallet.id}</TableCell>
                        <TableCell>
                          {wallet.name || 'Carteira Principal'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!userData?.Wallets || userData.Wallets.length === 0) && (
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          className="text-center text-muted-foreground"
                        >
                          Nenhuma carteira encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Seção de Senha */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Segurança</h2>
                <Dialog
                  open={passwordModalOpen}
                  onOpenChange={setPasswordModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Key className="mr-2 h-4 w-4" />
                      Redefinir Senha
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Redefinir Senha</DialogTitle>
                    </DialogHeader>
                    <Form {...passwordForm}>
                      <form
                        onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={passwordForm.control}
                          name="oldPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha Atual</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Digite sua senha atual"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nova Senha</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Digite sua nova senha"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirmar Nova Senha</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Confirme sua nova senha"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setPasswordModalOpen(false)
                              passwordForm.reset()
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1"
                            disabled={loading}
                          >
                            {loading && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Salvar
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Botões Salvar/Cancelar */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate({ to: '/' })}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                disabled={loading}
                onClick={userForm.handleSubmit(onUserSubmit)}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
