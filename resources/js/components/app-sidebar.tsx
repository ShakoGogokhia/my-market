import { NavFooter } from "@/components/nav-footer";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { type NavItem } from "@/types";
import { Link } from "@inertiajs/react";
import { BookOpen, Folder, LayoutGrid } from "lucide-react";
import AppLogo from "./app-logo";

const mainNavItems: NavItem[] = [
  {
    title: "პროდუქტები",
    href: "/dashboard",
    icon: LayoutGrid,
  },
  {
    title: "მომხმარებლები",
    href: "/users",
    icon: LayoutGrid,
  },
  {
    title: "შეკვეთები",
    href: "/admin/orders",
    icon: LayoutGrid,
  },
  {
    title: "ვაკანსია",
    href: "/admin/vacancies",
    icon: LayoutGrid,
  },
  {
    title: "პრომოკოდი",
    href: "/admin/promocodes",
    icon: LayoutGrid,
  },
  {
    title: "წინასწარი შეკვეთები",
    href: "/admin/pre-orders",
    icon: LayoutGrid,
  },
  {
    title: "კატეგორიები",
    href: "/admin/CategoryManager",
    icon: LayoutGrid,
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainNavItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
