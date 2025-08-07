import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { Eye, EyeOff, Fingerprint } from 'lucide-react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from './ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import { Input } from './ui/input'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/auth'
import { useWebAuthn } from '@/hooks/useWebAuthn'
import { cn } from '@/lib/utils'
// import { useNavigate } from "react-router";

const formSchema = z.object({
  email: z.string().email({
    message: 'Por favor, insira um endereço de e-mail válido.',
  }),
  password: z.string().min(1, {
    message: 'A senha não pode estar em branco.',
  }),
})

type LoginFormProps = React.HTMLAttributes<HTMLDivElement>

export function LoginForm({ className, ...props }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showBiometricButton, setShowBiometricButton] = useState(false);
  const { login, loading, isAuthenticated, handleLoginSuccess } = useAuth();
  const { 
    login: loginWithBiometrics, 
    isPwaMode, 
    isLoading: isBiometricLoading 
  } = useWebAuthn();
  // const Navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    // Verifica se o PWA está instalado e se o navegador suporta WebAuthn
    if (isPwaMode() && window.PublicKeyCredential) {
      setShowBiometricButton(true);
    }
  }, [isPwaMode]);

  if (isAuthenticated) {
    // Navigate("/");
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await login(values.email, values.password)
    } catch (error) {
      console.error('Erro no login:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao fazer login. Verifique suas credenciais.'
      )
    }
  }

  async function handleBiometricLogin() {
    try {
      const loginData = await loginWithBiometrics();
      if (loginData) {
        handleLoginSuccess(loginData);
        toast.success('Login biométrico realizado com sucesso!');
      }
      // Se loginData for nulo, o hook useWebAuthn já tratou o erro.
    } catch (error) {
      console.error('Erro no login biométrico:', error);
      toast.error('Ocorreu um erro inesperado durante o login biométrico.');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Acesse sua conta</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Digite seu e-mail e senha para entrar
            </p>
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="seu@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="********"
                      {...field}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={loading || isBiometricLoading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar com E-mail
            </Button>
            {showBiometricButton && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleBiometricLogin}
                disabled={isBiometricLoading || loading}
              >
                {isBiometricLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Fingerprint className="mr-2 h-4 w-4" />
                )}
                Entrar com Biometria
              </Button>
            )}
          </div>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Ainda não tem uma conta?
          </span>
        </div>
      </div>
      <Button variant="outline" asChild>
        <a href="/cadastro">Criar conta</a>
      </Button>
    </div>
  )
}
