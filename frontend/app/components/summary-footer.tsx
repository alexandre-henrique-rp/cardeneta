"use client";

interface SummaryFooterProps {
  valor: number;
}
export default function SummaryFooter({ valor }: SummaryFooterProps) {
  return (
    <div className="flex justify-between items-center font-bold text-lg">
      <span>Total</span>
      <span>
        {valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </span>
    </div>
  );
}
