import { UseFormReturn } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { WalletFormData } from "./types";

interface AddWalletModalProps {
  form: UseFormReturn<WalletFormData>;
  loading: boolean;
  onSubmit: (values: WalletFormData) => void;
  onCancel: () => void;
}

export function AddWalletModal({ form, loading, onSubmit, onCancel }: AddWalletModalProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="NewWalletId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código da Carteira</FormLabel>
              <FormControl>
                <Input placeholder="Digite o código da carteira" {...field} />
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
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </div>
      </form>
    </Form>
  );
}