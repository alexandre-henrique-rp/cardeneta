"use client";

import { useNavigate } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "./ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { ApiService } from "~/api/service";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface ATM {
  id: string;
  name: string;
  value: number;
  type: string;
  typePayment: string;
  createdAt: string;
}

interface FinancialData {
  id: string;
  atms: ATM[];
  currentBalance: number;
}

export default function FinancialDataTable({ data }: { data: FinancialData }) {
  const navigate = useNavigate();
  const api = ApiService();

  const handleDelete = (id: string) => {
    api
      .deleteAtm(id)
      .then(() => {
        toast.success("Registro deletado com sucesso");
        window.location.reload();
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  return (
    <div className="p-4 h-[calc(100vh-var(--header-height))] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>ações</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.atms.map((atm: any, index: number) => (
            <TableRow
              key={index}
              className="hover:bg-neutral-600 cursor-pointer"
              onClick={() => navigate(`/conta/${atm.id}`)}
            >
              <TableCell className="font-medium">{atm.createdAt}</TableCell>
              <TableCell>{atm.name}</TableCell>
              <TableCell>{atm.typePayment}</TableCell>
              <TableCell className="flex gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                  <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => navigate(`/conta/${atm.id}`)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Editar</p>
                  </TooltipContent>
                </Tooltip>
              
                <Tooltip>
                  <TooltipTrigger asChild>
                  <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleDelete(atm.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Deletar</p>
                  </TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell className="text-right">
                {atm.value.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
