'use client';

import {
  ArrowLeft,
  BookMarked,
  ClipboardList,
  CookingPot,
  Goal,
  History,
  Home,
  KeyRound,
  Salad,
  ScrollText,
  Tags,
  Users,
  WheatOff,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/base/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
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
import { IngredientDetectionDialog } from '@/modules/ingredients/components/ingredient-detection-dialog';

import { UserActions } from './user-actions';

interface DashboardLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

export function DashboardLayout({ children, showHeader = true }: DashboardLayoutProps) {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const sidebarDefaultOpen = useSidebarStateFromCookie();
  const [detectionDialogOpen, setDetectionDialogOpen] = useState(false);

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
        {
          title: 'Quản Lý Mục Tiêu Sức Khỏe',
          url: '/admin/health-goals',
          icon: Goal,
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
          title: 'Quản Lý Nhóm Nguyên Liệu',
          url: '/moderator/category',
          icon: ClipboardList,
        },
        {
          title: 'Quản Lý Nhãn Món Ăn',
          url: '/moderator/label',
          icon: Tags,
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
        title: 'Mục Tiêu Sức Khỏe',
        url: '/profile/health-goals',
        icon: Goal,
      },
      {
        title: 'Hạn Chế Thành Phần',
        url: '/diet-restrictions',
        icon: WheatOff,
      },
      {
        title: 'Công Thức Của Tôi',
        url: '/myrecipe',
        icon: CookingPot,
      },
      {
        title: 'Công Thức Đã Lưu',
        url: '/saved-recipes',
        icon: BookMarked,
      },
      {
        title: 'Công Thức Đã Xem',
        url: '/history',
        icon: History,
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
        {showHeader && (
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            {/* Back button for recipe details page */}
            {pathname.startsWith('/recipe/') &&
              !pathname.endsWith('/edit') &&
              !pathname.endsWith('/new') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="gap-2"
                  title="Quay lại"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Quay Lại
                </Button>
              )}
            <div className="flex flex-1 items-center justify-end gap-4">
              {/* Ingredient Detection Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDetectionDialogOpen(true)}
                className="border-[#99b94a] whitespace-nowrap text-[#99b94a] hover:bg-[#99b94a]/10"
                title="Quét nguyên liệu từ ảnh"
              >
                Quét Nguyên Liệu
              </Button>

              <Link href="/recipe/new">
                <Button size="sm" className="bg-[#99b94a] whitespace-nowrap hover:bg-[#7a8f3a]">
                  + Viết món mới
                </Button>
              </Link>
              {user && <UserActions user={user} onLogout={handleLogout} />}
            </div>
          </header>
        )}
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>

        {/* Ingredient Detection Dialog */}
        <IngredientDetectionDialog
          open={detectionDialogOpen}
          onOpenChange={setDetectionDialogOpen}
          onSelect={(ingredients) => {
            // TODO: Implement search by selected ingredients
            console.warn('Selected ingredients:', ingredients);
          }}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
