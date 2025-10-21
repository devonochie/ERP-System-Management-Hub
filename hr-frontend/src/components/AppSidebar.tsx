import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  DollarSign, 
  BarChart3, 
  Settings 
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { LoginDialog } from '@/components/LoginDialog';
import { RegisterDialog } from '@/components/RegisterDialog';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Employees', url: '/employees', icon: Users },
  { title: 'Attendance', url: '/attendance', icon: Calendar },
  { title: 'Leave Requests', url: '/leaves', icon: FileText },
  { title: 'Payroll', url: '/payroll', icon: DollarSign },
  { title: 'Reports', url: '/reports', icon: BarChart3 },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const collapsed = state === 'collapsed';

  return (
    <Sidebar className={`border-r border-sidebar-border transition-all ${collapsed ? 'w-16' : 'w-64'}`}>
      <SidebarContent className="bg-sidebar">
        {!collapsed && (
          <div className="p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  ERP System
                </h2>
                <p className="text-xs text-muted-foreground">Management Hub</p>
              </div>
            </div>
          </div>
        )}

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-muted-foreground px-6">Main Menu</SidebarGroupLabel>}
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`mx-2 rounded-xl transition-smooth ${
                      isActive(item.url)
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                    }`}
                  >
                    <NavLink to={item.url} end={item.url === '/'}>
                      <item.icon className={`${collapsed ? '' : 'mr-3'} h-5 w-5`} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-sidebar-border">
        <div className={`flex ${collapsed ? 'flex-col' : 'flex-row'} gap-2`}>
          <LoginDialog />
          <RegisterDialog />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
