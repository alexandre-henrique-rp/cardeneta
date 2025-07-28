import { LoginForm } from "~/components/login-form"
import type { Route } from "./+types/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "GDC | Login" },
    { name: "description", content: "Login do GDC" },
  ];
}


export default function LoginPage() {

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <img src="/logo.png" alt="KingDevTec" className="w-16" />
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
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.4] dark:grayscale"
        />
      </div>
    </div>
  )

}
