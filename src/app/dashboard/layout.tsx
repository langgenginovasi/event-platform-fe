"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  ScanLine,
  LogOut,
  Menu,
  Home,
  Settings,
  ClipboardList,
  QrCode,
  BarChart,
  ChevronLeft,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import { GET_EVENT_GROUP_DETAIL } from "@/lib/api-endpoints";

// ─── Nav item config ────────────────────────────────────────────────────────

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const superAdminExtras: NavItem[] = [
  { name: "Manajemen Pengguna", href: "/dashboard/users", icon: Users },
  { name: "Pengaturan", href: "/dashboard/settings", icon: Settings },
];

const globalEventAdminNav: NavItem[] = [
  { name: "Beranda", href: "/dashboard", icon: Home },
  { name: "Grup Event", href: "/dashboard/event-group", icon: LayoutDashboard },
  { name: "Peserta", href: "/dashboard/participant", icon: Users },
];

const getWorkspaceNav = (id: string): NavItem[] => [
  { name: "Ringkasan", href: `/dashboard/event-group/${id}`, icon: LayoutDashboard },
  { name: "Event", href: `/dashboard/event-group/${id}/event`, icon: CalendarDays },
  { name: "Registrasi", href: `/dashboard/event-group/${id}/registration`, icon: ClipboardList },
  { name: "Tipe Partisipasi", href: `/dashboard/event-group/${id}/participation-types`, icon: Settings },
  { name: "Pindai QR", href: `/dashboard/event-group/${id}/scan`, icon: QrCode },
  { name: "Laporan", href: `/dashboard/event-group/${id}/export`, icon: BarChart },
];

// ─── Sidebar Content Component ──────────────────────────────────────────────

function SidebarContent({
  navItems,
  pathname,
  userName,
  role,
  isWorkspaceMode,
}: {
  navItems: NavItem[];
  pathname: string;
  userName?: string | null;
  role?: string;
  isWorkspaceMode?: boolean;
}) {
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--brand-primary)" }}>
      {/* Logo / Brand */}
      <div
        className="flex items-center justify-center h-40"
        style={{ backgroundColor: "var(--brand-primary)", borderRadius: "0 0 35px 0" }}
      >
        <div className="flex flex-col items-center">
          <Image 
            src="/logo-horizontal-white.png" 
            alt="Event Platform Logo" 
            width={180} 
            height={60} 
            className="object-contain drop-shadow-md"
            priority
          />
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-5 px-5 space-y-4 overflow-y-auto">
        {isWorkspaceMode && (
          <a
            href="/dashboard/event-group"
            className="sidebar-nav-item mb-4 bg-white/5 border border-white/10"
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                "var(--sidebar-hover)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                "rgba(255, 255, 255, 0.05)")
            }
          >
            <ChevronLeft className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-sm">Kembali ke Global</span>
          </a>
        )}

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              className="sidebar-nav-item"
              style={
                isActive
                  ? { backgroundColor: "var(--sidebar-active)" }
                  : {}
              }
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                    "var(--sidebar-hover)";
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                    "transparent";
              }}
            >
              <Icon className="w-6 h-6 shrink-0" />
              <span>{item.name}</span>
            </a>
          );
        })}

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="sidebar-nav-item w-full text-left mt-4"
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "var(--sidebar-hover)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "transparent")
          }
        >
          <LogOut className="w-6 h-6 shrink-0" />
          <span>Keluar</span>
        </button>
      </nav>
    </div>
  );
}

// ─── Utility for friendly role names ────────────────────────────────────────

function formatRoleName(role?: string) {
  if (!role) return "Pengguna";
  switch (role) {
    case "SUPER_ADMIN": return "Super Admin";
    case "EVENT_ADMIN": return "Admin Event";
    case "OPERATOR": return "Operator";
    default: return role.replace(/_/g, " ");
  }
}

// ─── Dashboard Layout ───────────────────────────────────────────────────────

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Detect workspace mode from URL (/dashboard/event-group/[id]/...)
  const workspaceMatch = pathname.match(/\/dashboard\/event-group\/([^/]+)/);
  const isWorkspaceMode = !!workspaceMatch;
  const workspaceId = isWorkspaceMode ? workspaceMatch[1] : null;

  // Fetch Workspace Detail if in Workspace mode (Rule of Hooks: must be called unconditionally / above returns)
  const { data: eventGroupData } = useSWR(isWorkspaceMode && workspaceId ? GET_EVENT_GROUP_DETAIL(workspaceId) : null);

  // Close sheet on navigation
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
          style={{ borderColor: "var(--brand-primary)" }}
        />
      </div>
    );
  }

  if (!session) return null;

  const role = session.user?.role;
  
  let navItems: NavItem[] = [];
  
  if (isWorkspaceMode && workspaceId) {
    navItems = getWorkspaceNav(workspaceId);
  } else {
    // Global Mode
    navItems = [...globalEventAdminNav];
    if (role === "SUPER_ADMIN") {
      navItems = [...navItems, ...superAdminExtras];
    }
  }

  // Get page title from nav items (handling dynamic matches)
  const sortedNavItems = [...navItems].sort((a, b) => b.href.length - a.href.length);
  const activeItem = sortedNavItems.find((item) => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)));
  
  let pageTitle = activeItem?.name ?? "Beranda";
  let subTitle = null;

  if (isWorkspaceMode) {
    if (eventGroupData?.data) {
      subTitle = eventGroupData.data.name;
    } else {
      subTitle = "Memuat Workspace...";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Bottom Sheet Menu */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="w-full p-0 border-t-0 rounded-t-2xl max-h-[80vh] overflow-y-auto"
          style={{ 
            backgroundColor: "var(--brand-primary)",
            paddingBottom: "max(16px, env(safe-area-inset-bottom))"
          }}
        >
          {/* Accessible title for screen readers */}
          <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
          <SidebarContent
            navItems={navItems}
            pathname={pathname}
            userName={session.user?.name}
            role={role}
            isWorkspaceMode={isWorkspaceMode}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar — always visible */}
      <aside className="hidden lg:block lg:shrink-0 w-[260px]">
        <div className="fixed inset-y-0 left-0 w-[260px]">
          <SidebarContent
            navItems={navItems}
            pathname={pathname}
            userName={session.user?.name}
            role={role}
            isWorkspaceMode={isWorkspaceMode}
          />
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 md:px-10 py-5">
            {/* Mobile hamburger (Removed in favor of bottom bar) */}
            <div className="lg:hidden w-6" />

            {/* Page title */}
            <div className="flex flex-col">
              <h2
                className="text-2xl md:text-4xl font-extrabold"
                style={{ color: "var(--brand-primary)" }}
              >
                {pageTitle}
              </h2>
              {subTitle && (
                <span className="text-sm md:text-base text-gray-500 font-medium mt-1">
                  {subTitle}
                </span>
              )}
            </div>

            {/* User avatar */}
            {session.user?.name && (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end">
                  <span className="font-bold text-sm" style={{ color: "var(--brand-primary)" }}>
                    {session.user.name}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {formatRoleName(session.user.role)}
                  </span>
                </div>
                <div
                  className="flex items-center gap-2 p-1 rounded-full shadow-sm"
                  style={{ backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      session.user.name
                    )}&background=e5e7eb&color=001a41&bold=true`}
                    alt={session.user.name}
                    width={36}
                    height={36}
                    className="rounded-full bg-white p-0.5 shadow-sm"
                    style={{ border: "2px solid var(--brand-primary)" }}
                  />
                  <div className="md:hidden flex flex-col pr-3 py-0.5">
                    <span className="font-bold text-xs" style={{ color: "var(--brand-primary)" }}>
                      {session.user.name}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium leading-tight">
                      {formatRoleName(session.user.role)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 md:px-12 md:py-10 overflow-y-auto pb-28 lg:pb-10 w-full">{children}</main>
      </div>

      {/* Mobile Bottom Navbar */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t lg:hidden"
        style={{ 
          borderColor: "rgba(0,0,0,0.1)",
          paddingBottom: "max(16px, env(safe-area-inset-bottom))"
        }}
      >
        <div className="relative flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            // Skip "Laporan" on mobile bottom bar to save space
            if (item.name === "Laporan") return null;

            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            if (item.name === "Scan QR") {
              return (
                <div key={item.name} className="relative -top-5 flex justify-center w-16">
                  <button
                    onClick={() => router.push(item.href)}
                    className="flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg shadow-blue-900/20 transition-transform active:scale-95"
                    style={{ backgroundColor: "var(--brand-primary)", border: "4px solid white" }}
                  >
                    <Icon className="w-6 h-6" />
                  </button>
                </div>
              );
            }

            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className="flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors"
                style={isActive ? { color: "var(--brand-primary)" } : { color: "#6b7280" }}
              >
                <div className="relative flex justify-center w-full">
                  <div className={`p-1.5 rounded-full ${isActive ? 'bg-blue-50' : ''}`} style={isActive ? { backgroundColor: "rgba(0, 26, 65, 0.1)" } : {}}>
                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                </div>
                <span className="text-[10px] md:text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis w-full text-center px-1">
                  {item.name}
                </span>
              </button>
            );
          })}

          {/* Menu Button */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors text-gray-500"
          >
            <Menu className="w-5 h-5 md:w-6 md:h-6" />
            <span className="text-[10px] md:text-xs font-semibold">Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}

