import { Outlet, createRootRoute } from '@tanstack/react-router'
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { AuthProvider } from '@/context/auth'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Outlet />
        <Toaster richColors position="top-right" />
      </ThemeProvider>
      {/* <TanStackRouterDevtools /> */}
    </AuthProvider>
  ),
})
