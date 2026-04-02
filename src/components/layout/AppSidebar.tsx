import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  ArrowLeftRight,
  Link2,
  Code,
  ShieldCheck,
  LogOut,
  User,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { NeXPayLogo } from './NeXPayLogo';

const walletItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Extrato', href: '/dashboard/transactions', icon: Receipt },
  { label: 'Exchange', href: '/exchange', icon: ArrowLeftRight },
];

const platformItems = [
  { label: 'Links de Pagamento', href: '/dashboard/payment-links', icon: Link2 },
  { label: 'Developers', href: '/dashboard/developers', icon: Code },
  { label: 'Segurança', href: '/dashboard/transactions', icon: ShieldCheck },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* Header with logo */}
      <SidebarHeader className="px-4 py-4">
        <NeXPayLogo size="lg" />
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Carteira Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 group-data-[collapsible=icon]:hidden">
            Carteira
          </SidebarGroupLabel>
          <SidebarMenu>
            {walletItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Plataforma Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 group-data-[collapsible=icon]:hidden">
            Plataforma
          </SidebarGroupLabel>
          <SidebarMenu>
            {platformItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with user info and logout */}
      <SidebarFooter className="px-2 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-1.5 min-w-0 group-data-[collapsible=icon]:justify-center">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                <User className="h-4 w-4 text-gray-300" />
              </div>
              <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium text-white truncate">{user?.name}</span>
                <span className="text-xs text-gray-400 truncate">{user?.email}</span>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              tooltip="Sair"
              className="text-gray-400 hover:text-red-400 hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
