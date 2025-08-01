import { AtmForm } from '@/components/atm-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(private)/_layout/novo-registro/')({
  head: () => ({
    meta: [
      {
        title: 'CadernetaApp | Novo Registro',
        description: 'Cadastre uma nova transação financeira',
      },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Novo Registro</h1>
            <p className="text-muted-foreground">
              Cadastre uma nova transação financeira
            </p>
          </div>
          <AtmForm mode="create" />
        </div>
      </div>
    </div>
  )
}
