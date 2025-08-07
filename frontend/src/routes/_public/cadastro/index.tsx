import { RegisterForm } from '@/components/register-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/cadastro/')({
  head: () => ({
    meta: [
      {
        title: 'CadernetaApp | Cadastro',
        description: 'Cadastre-se para começar a usar o CadernetaApp',
      },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-1 font-medium">
            <img src="/logo.png" alt="CadernetaApp" className="w-40" />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <RegisterForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/cenas-de-pessoas-trabalhar.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.8] dark:grayscale"
        />
      </div>
    </div>
  )
}
