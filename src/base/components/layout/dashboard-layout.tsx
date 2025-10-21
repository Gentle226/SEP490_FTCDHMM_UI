'use client';

import {
  ClipboardList,
  FileText,
  Home,
  KeyRound,
  Salad,
  ScrollText,
  Tags,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import {
  Sidebar,
  SidebarContent,
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
import { useSidebarStateFromCookie } from '@/base/hooks/use-sidebar-cookie';
import { Role, useAuth } from '@/modules/auth';
import { authService } from '@/modules/auth/services/auth.service';

import { UserActions } from './user-actions';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const sidebarDefaultOpen = useSidebarStateFromCookie();

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear user state and redirect
      setUser(null);
      router.push('/');
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
      // {
      //   title: 'Dữ Liệu Thống Kê',
      //   url: '/dashboard',
      //   icon: LayoutDashboard,
      // },
    ];

    if (user?.role === Role.ADMIN) {
      return [
        ...commonItems,
        {
          title: 'Quản Lý Kiểm Duyệt Viên',
          url: '/admin/dashboard',
          icon: Users,
        },
        {
          title: 'Quản Lý Phân Quyền',
          url: '/admin/permissions',
          icon: KeyRound,
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
          title: 'Quản Lý Nguyên Liệu',
          url: '/moderator/ingredient',
          icon: Salad,
        },
        {
          title: 'Quản Lý Nhãn Thực Phẩm',
          url: '/moderator/label',
          icon: Tags,
        },
        {
          title: 'Quản Lý Nhóm Thực Phẩm',
          url: '/moderator/category',
          icon: ClipboardList,
        },
        {
          title: 'Nguyên Tắc Đăng Bài',
          url: '/moderator/rule',
          icon: ScrollText,
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

  // Don't render until we have the sidebar state from cookie
  if (sidebarDefaultOpen === null) {
    return null; // or a loading spinner
  }

  return (
    <SidebarProvider defaultOpen={sidebarDefaultOpen}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:justify-center">
            <div className="bg-[url('/FitFood Tracker Square Logo.png')] text-primary-foreground flex h-8 w-12 flex-shrink-0 items-center justify-center rounded-lg">
              <Image
                src="/FitFood Tracker Square Logo.png"
                alt="FitFood Tracker Logo"
                width={150}
                height={150}
              />
            </div>
            <div className="flex min-w-0 flex-col transition-opacity duration-200 group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:opacity-0">
              <span className="truncate text-sm font-semibold text-[#99b94a]">FitFood Tracker</span>
              <span className="text-muted-foreground truncate text-xs">
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
                {navigationItems.map((item) => {
                  const isActive =
                    pathname === item.url || (item.url !== '/' && pathname.startsWith(item.url));
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={isActive}
                        className={isActive ? 'sidebar-item-active' : ''}
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
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
