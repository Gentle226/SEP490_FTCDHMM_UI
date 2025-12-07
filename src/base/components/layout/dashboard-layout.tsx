'use client';

import {
  ArrowLeft,
  BookMarked,
  ClipboardList,
  ClockAlert,
  CookingPot,
  FileEdit,
  Goal,
  History,
  Home,
  KeyRound,
  List,
  MessageSquareWarning,
  Salad,
  ScanSearch,
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
import { PermissionPolicies, Role, hasAnyPermission, useAuth } from '@/modules/auth';
import { authService } from '@/modules/auth/services/auth.service';
import { IngredientDetectionDialog } from '@/modules/ingredients/components/ingredient-detection-dialog';
import { NotificationBell } from '@/modules/notification';

import { UserActions } from './user-actions';

interface DashboardLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  hideCreateButton?: boolean;
}

export function DashboardLayout({
  children,
  showHeader = true,
  hideCreateButton = false,
}: DashboardLayoutProps) {
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

  // Define navigation items based on user permissions
  const getNavigationItems = () => {
    interface NavigationItem {
      title: string;
      url: string;
      icon: React.ComponentType<{ className?: string }>;
    }

    const items: NavigationItem[] = [
      {
        title: 'Trang Chủ',
        url: '/',
        icon: Home,
      },
    ];

    // Permission-based navigation items
    const permissionBasedItems: Array<{
      title: string;
      url: string;
      icon: React.ComponentType<{ className?: string }>;
      permissions?: string[];
      requiresRole?: Role;
    }> = [
      {
        title: 'Quản Lý Người Dùng',
        url: '/admin/users',
        icon: Users,
        permissions: [PermissionPolicies.USER_MANAGEMENT_VIEW],
      },
      {
        title: 'Quản Lý Phân Quyền',
        url: '/admin/permissions',
        icon: KeyRound,
        // Only Admin role can access permission management
        requiresRole: Role.ADMIN,
      },
      {
        title: 'Duyệt Công Thức',
        url: '/admin/pending-recipes',
        icon: ClockAlert,
        permissions: [PermissionPolicies.RECIPE_APPROVE],
      },
      {
        title: 'Quản Lý Mục Tiêu Sức Khỏe',
        url: '/admin/health-goals',
        icon: Goal,
        permissions: [
          PermissionPolicies.HEALTH_GOAL_CREATE,
          PermissionPolicies.HEALTH_GOAL_UPDATE,
          PermissionPolicies.HEALTH_GOAL_DELETE,
        ],
      },
      {
        title: 'Quản Lý Báo Cáo',
        url: '/admin/reports',
        icon: MessageSquareWarning,
        permissions: [PermissionPolicies.REPORT_VIEW],
      },
      {
        title: 'Quản Lý Công Thức',
        url: '/moderator/recipe',
        icon: List,
        permissions: [PermissionPolicies.RECIPE_MANAGEMENT_VIEW],
      },
      {
        title: 'Quản Lý Nguyên Liệu',
        url: '/moderator/ingredient',
        icon: Salad,
        permissions: [PermissionPolicies.INGREDIENT_MANAGER_VIEW],
      },
      {
        title: 'Quản Lý Nhóm Nguyên Liệu',
        url: '/moderator/category',
        icon: ClipboardList,
        permissions: [PermissionPolicies.INGREDIENT_CATEGORY_CREATE],
      },
      {
        title: 'Quản Lý Nhãn Món Ăn',
        url: '/moderator/label',
        icon: Tags,
        permissions: [
          PermissionPolicies.LABEL_CREATE,
          PermissionPolicies.LABEL_UPDATE,
          PermissionPolicies.LABEL_DELETE,
        ],
      },
    ];

    // Filter permission-based items
    permissionBasedItems.forEach((item) => {
      if (item.requiresRole) {
        // Check role
        if (user?.role === item.requiresRole) {
          items.push({ title: item.title, url: item.url, icon: item.icon });
        }
      } else if (item.permissions) {
        // Check if user has any of the required permissions
        if (hasAnyPermission(user, item.permissions)) {
          items.push({ title: item.title, url: item.url, icon: item.icon });
        }
      }
    });

    // Customer items - always show for Customer role without permissions check
    if (user?.role === Role.CUSTOMER || !user?.permissions || user.permissions.length === 0) {
      items.push(
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
          title: 'Bản Nháp Của Tôi',
          url: '/drafts',
          icon: FileEdit,
        },
        {
          title: 'Công Thức Chờ Duyệt',
          url: '/pending-recipes',
          icon: ClockAlert,
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
      );
    }

    return items;
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
                {user?.role === Role.CUSTOMER && 'Khách Hàng'}
                {user?.role && user.role !== Role.ADMIN && user.role !== Role.CUSTOMER && user.role}
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
            {/* Back button for recipe and draft edit pages */}
            {(pathname.includes('/recipe/') || pathname.includes('/drafts/')) &&
              pathname.endsWith('/edit') && (
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
            <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
              {/* Ingredient Detection Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDetectionDialogOpen(true)}
                className="border-[#99b94a] whitespace-nowrap text-[#99b94a] hover:bg-[#99b94a]/10"
                title="Quét nguyên liệu từ ảnh"
              >
                <span className="hidden sm:inline">Quét Nguyên Liệu</span>
                <ScanSearch className="h-4 w-4 sm:hidden" />
              </Button>

              {!hideCreateButton && (
                <Link href="/recipe/new">
                  <Button size="sm" className="bg-[#99b94a] whitespace-nowrap hover:bg-[#7a8f3a]">
                    <span className="hidden sm:inline">+ Viết món mới</span>
                    <span className="sm:hidden">+ Món mới</span>
                  </Button>
                </Link>
              )}
              <NotificationBell userId={user?.id} />
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
