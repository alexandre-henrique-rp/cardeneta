import { LoginForm } from '@/components/login-form'
import { createFileRoute } from '@tanstack/react-router'
import { NotebookPenIcon } from 'lucide-react'

export const Route = createFileRoute('/_public/login/')({
  component: Login,
})

function Login() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-1 font-medium">
            <NotebookPenIcon className="w-8 h-8" />
            <span className="text-2xl font-bold text-primary font-ubuntu">
              Cardeneta App
            </span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/desenvolvimento-de-aplicativo-movel.jpg"
          alt="Tela de login mostrando um aplicativo móvel"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.4] dark:grayscale"
        />
      </div>
    </div>
  )
}
