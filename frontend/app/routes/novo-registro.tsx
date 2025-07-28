import { AtmForm } from "~/components/atm-form";
import type { Route } from "./+types/novo-registro";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "GDC | Novo Registro" },
    { name: "description", content: "Cadastrar novo ATM" },
  ];
}

export default function NovoRegistroPage() {
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
  );
}