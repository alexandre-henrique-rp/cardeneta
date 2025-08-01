import { ChartNoAxesCombinedIcon, FilePlus2, NotebookPenIcon, ServerCog } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: ChartNoAxesCombinedIcon
    },
    {
      title: "Novo Registro",
      url: "/novo-registro",
      icon: FilePlus2
    }
  ],
  navSecondary: [
    {
      title: "Configurações",
      url: "/configuracoes",
      icon: ServerCog
    }
  ]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="w-full flex gap-1 items-center justify-center">
                  <NotebookPenIcon className="w-7 h-7" />
                  <span className="text-xl font-bold text-primary font-ubuntu">
                    Cardeneta App
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
