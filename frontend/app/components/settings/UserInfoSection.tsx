import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { User } from "./types";
import { useUserSettings } from "./hooks/useUserSettings";

interface UserInfoSectionProps {
  userData: User | null;
}

export function UserInfoSection({ userData }: UserInfoSectionProps) {
  const { userForm } = useUserSettings(userData);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Informações Pessoais</h2>
      <Form {...userForm}>
        <div className="space-y-6">
          <FormField
            control={userForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Seu nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={userForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="seu@email.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </div>
  );
}