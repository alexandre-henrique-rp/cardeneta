import { AtmForm } from "~/components/atm-form";
import type { Route } from "./+types/conta";
import { ApiService } from "~/api/service";
import { useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "GDC | Editar Registro" },
    { name: "description", content: "Editar registro ATM" },
  ];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const { id } = params;
  const api = ApiService();
  const atm = await api.getAtm(id);
  if (!atm) {
    return null;
  }
  return atm;
}

export default function ContaPage({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!loaderData) {
      toast.error("Registro não encontrado");
      navigate("/");
    }
  }, [loaderData]);

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
          <AtmForm mode="edit" data={loaderData} />
        </div>
      </div>
    </div>
  );
}