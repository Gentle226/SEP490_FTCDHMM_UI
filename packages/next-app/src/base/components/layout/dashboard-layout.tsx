'use client';

import {
  BarChart3,
  FileText,
  Home,
  KeyRound,
  MessageSquare,
  Settings,
  Shield,
  User,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/base/components/ui/sidebar';
import { Role, useAuth } from '@/modules/auth';
import { authService } from '@/modules/auth/services/auth.service';

import { UserActions } from './user-actions';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, setUser } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear user state and redirect
      setUser(null);
      router.push('/auth/login');
    }
  };

  // Define navigation items based on user role
  const getNavigationItems = () => {
    const commonItems = [
      {
        title: 'Trang Chủ',
        url: '/',
        icon: Home,
      },
      {
        title: 'Bảng Điều Khiển',
        url: '/dashboard',
        icon: BarChart3,
      },
      {
        title: 'Hồ Sơ',
        url: '/profile',
        icon: User,
      },
    ];

    if (user?.role === Role.ADMIN) {
      return [
        ...commonItems,
        {
          title: 'Quản Lý Moderator',
          url: '/admin/dashboard',
          icon: Shield,
        },
        {
          title: 'Quản Lý Phân Quyền',
          url: '/admin/permissions',
          icon: KeyRound,
        },
        {
          title: 'Cài Đặt Hệ Thống',
          url: '/admin/settings',
          icon: Settings,
        },
        {
          title: 'Nhật Ký Kiểm Tra',
          url: '/admin/audit-logs',
          icon: FileText,
        },
      ];
    }

    if (user?.role === Role.MODERATOR) {
      return [
        ...commonItems,
        {
          title: 'Quản Lý Khách Hàng',
          url: '/moderator/dashboard',
          icon: Users,
        },
        {
          title: 'Kiểm Duyệt Nội Dung',
          url: '/moderator/content',
          icon: MessageSquare,
        },
        {
          title: 'Báo Cáo Người Dùng',
          url: '/moderator/reports',
          icon: FileText,
        },
      ];
    }

    // Customer items
    return [
      ...commonItems,
      {
        title: 'Công Thức Nấu Ăn',
        url: '/customer/recipes',
        icon: FileText,
      },
    ];
  };

  const navigationItems = getNavigationItems();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
              <Home className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">FitFood Tracker</span>
              <span className="text-muted-foreground text-xs">
                {user?.role === Role.ADMIN && 'Quản Trị Viên'}
                {user?.role === Role.MODERATOR && 'Người Kiểm Duyệt'}
                {user?.role === Role.CUSTOMER && 'Khách Hàng'}
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Điều Hướng</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="p-2">
            {user && (
              <div className="bg-muted flex items-center gap-2 rounded-lg p-2">
                <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">
                    {user.fullName ||
                      (user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : null) ||
                      user.email}
                  </span>
                  <span className="text-muted-foreground text-xs">{user.role}</span>
                </div>
              </div>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center justify-end">
            {user && <UserActions user={user} onLogout={handleLogout} />}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
