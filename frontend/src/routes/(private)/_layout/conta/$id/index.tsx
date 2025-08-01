import { ApiService } from '@/api/service'
import { AtmForm } from '@/components/atm-form'
import { createFileRoute, useLoaderData } from '@tanstack/react-router'

export const Route = createFileRoute('/(private)/_layout/conta/$id/')({
  loader: ({ params }) => {
    const id = params.id
    const api = ApiService()
    const data = api.getAtm(id)
    return data
  },
  component: ContaIdComponent,
  head: () => ({
    meta: [
      {
        title: `CadernetaApp | Editar Registro`,
        description: 'Editar Registro',
      },
    ],
  }),
})

function ContaIdComponent() {
  const data = useLoaderData<any>({ from: '/(private)/_layout/conta/$id/' })
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Editar Registro</h1>
            <p className="text-muted-foreground">
              Atualize os dados da transação
            </p>
          </div>
          <AtmForm mode="edit" data={data} />
        </div>
      </div>
    </div>
  )
}
