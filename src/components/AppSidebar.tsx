import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Settings,
  Bell,
  FileText,
  TrendingUp,
  Calendar,
  Building2,
  Briefcase,
  CalendarDays,
  Clock,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "لوحة التحكم", url: "/", icon: LayoutDashboard },
  { title: "الموظفين", url: "/employees", icon: Users },
  { title: "الأقسام", url: "/departments", icon: Building2 },
  { title: "المناصب", url: "/positions", icon: Briefcase },
  { title: "طلبات الإجازة", url: "/leave-requests", icon: CalendarDays },
  { title: "الحضور والانصراف", url: "/attendance", icon: Clock },
  { title: "التحليلات", url: "/analytics", icon: BarChart3 },
  { title: "التقارير", url: "/reports", icon: FileText },
  { title: "الإحصائيات", url: "/statistics", icon: TrendingUp },
  { title: "التقويم", url: "/calendar", icon: Calendar },
  { title: "الإشعارات", url: "/notifications", icon: Bell },
  { title: "الإعدادات", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar className="border-r border-sidebar-border" side="right">
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shadow-glow">
            <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
          </div>
          {open && (
            <div className="animate-fade-in-up">
              <h2 className="text-lg font-bold text-sidebar-foreground">لوحة التحكم</h2>
              <p className="text-xs text-muted-foreground">نظام الإدارة</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground px-3">القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${isActive
                          ? "bg-sidebar-accent text-primary font-semibold shadow-glow"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-primary"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {open && <span className="animate-fade-in-up">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
