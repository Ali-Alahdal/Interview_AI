/**
 * DashboardLayout — Shared sidebar layout for all dashboard roles
 * Design: Modern Dark SaaS / Deep Space Intelligence
 * Features: Fixed left sidebar, role-aware nav items, user profile, logout
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { Brain, LayoutDashboard, BookOpen, Users, Settings, LogOut, ChevronLeft, ChevronRight, Bell, PlusCircle, BarChart3, FileText, Shield, Menu } from "lucide-react";
const NAV_ITEMS = [
  { label: "Ana Panel", icon: <LayoutDashboard className="w-4 h-4" />, path: "/dashboard/trainee", roles: ["trainee"] },
  { label: "Eğitimlerim", icon: <BookOpen className="w-4 h-4" />, path: "/courses", roles: ["trainee"] },
  { label: "Denemelerim", icon: <BarChart3 className="w-4 h-4" />, path: "/attempts", roles: ["trainee"] },
  { label: "Ana Panel", icon: <LayoutDashboard className="w-4 h-4" />, path: "/dashboard/creator", roles: ["creator"] },
  { label: "Kurs Oluştur", icon: <PlusCircle className="w-4 h-4" />, path: "/creator/courses", roles: ["creator"] },
  { label: "Analizler", icon: <BarChart3 className="w-4 h-4" />, path: "/creator/analytics", roles: ["creator"] },
  { label: "Yönetici Paneli", icon: <Shield className="w-4 h-4" />, path: "/dashboard/admin", roles: ["admin"] },
  { label: "Kullanıcılar", icon: <Users className="w-4 h-4" />, path: "/admin/users", roles: ["admin"] },
  { label: "İçerikler", icon: <FileText className="w-4 h-4" />, path: "/admin/content", roles: ["admin"] },
  { label: "Analizler", icon: <BarChart3 className="w-4 h-4" />, path: "/admin/analytics", roles: ["admin"] },
];
const BOTTOM_ITEMS = [
  { label: "Ayarlar", icon: <Settings className="w-4 h-4" />, path: "/settings", roles: ["trainee", "creator", "admin"] },
];
export default function DashboardLayout({ children, title }) {
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const { user, logout } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleLogout = () => {
    logout();
    toast.success("Başarıyla çıkış yapıldı");
    navigate("/login");
  };
  const handleNav = (path) => {
    const comingSoon = ["/settings"];
    if (comingSoon.includes(path)) {
      toast.info("Bu özellik yakında eklenecektir");
      return;
    }
    navigate(path);
    setMobileOpen(false);
  };

  const activeRole = (user?.role == "0" || user?.role == "1") ? "admin" :
    user?.role == "2" ? "creator" :
      user?.role == "3" ? "trainee" :
        user?.role?.toString().toLowerCase() || "";

  const filteredNav = NAV_ITEMS.filter(item => user && item.roles.includes(activeRole));
  const filteredBottom = BOTTOM_ITEMS.filter(item => user && item.roles.includes(activeRole));

  const roleColors = {
    admin: "from-rose-500 to-pink-600",
    creator: "from-amber-500 to-orange-600",
    trainee: "from-blue-500 to-cyan-600",
  };
  const roleColor = user ? roleColors[activeRole] : "from-blue-500 to-cyan-600";
  const SidebarContent = () => (<div className="flex flex-col h-full font-sans">
    {/* Logo */}
    <div className={`flex items-center gap-3 px-4 py-6 border-b border-sidebar-border ${collapsed ? "justify-center" : ""}`}>
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColor} flex items-center justify-center flex-shrink-0 shadow-lg shadow-${roleColor.split('-')[1]}/20`}>
        <Brain className="w-5 h-5 text-white" />
      </div>
      {!collapsed && <span className="text-xl font-bold heading-font text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">ÖYS Platformu</span>}
    </div>



    {/* Nav items */}
    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
      {filteredNav.map(item => {
        const isActive = location === item.path;
        return (<button key={item.path} onClick={() => handleNav(item.path)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${isActive
          ? "sidebar-item-active shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"} ${collapsed ? "justify-center" : ""}`} title={collapsed ? item.label : undefined}>
          <span className={`flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>{item.icon}</span>
          {!collapsed && <span>{item.label}</span>}
        </button>);
      })}
    </nav>

    {/* Bottom items */}
    <div className="px-4 py-4 border-t border-sidebar-border space-y-2 bg-sidebar/50 backdrop-blur-sm">
      {filteredBottom.map(item => (<button key={item.path} onClick={() => handleNav(item.path)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-300 ${collapsed ? "justify-center" : ""}`} title={collapsed ? item.label : undefined}>
        <span className="flex-shrink-0">{item.icon}</span>
        {!collapsed && <span>{item.label}</span>}
      </button>))}
      <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300 ${collapsed ? "justify-center" : ""}`} title={collapsed ? "Çıkış Yap" : undefined}>
        <LogOut className="w-4 h-4 flex-shrink-0" />
        {!collapsed && <span>Çıkış Yap</span>}
      </button>
    </div>

    {/* Collapse toggle (desktop) */}
    <button onClick={() => setCollapsed(p => !p)} className="hidden lg:flex items-center justify-center w-full py-4 border-t border-sidebar-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
      {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
    </button>
  </div>);
  
  return (<div className="min-h-screen flex bg-background font-sans selection:bg-primary/20">
    {/* Desktop Sidebar */}
    <aside className={`hidden lg:flex flex-col flex-shrink-0 bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-40 ${collapsed ? "w-20" : "w-64"}`}>
      <SidebarContent />
    </aside>

    {/* Mobile Sidebar Overlay */}
    {mobileOpen && (<div className="lg:hidden fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setMobileOpen(false)} />
      <aside className="relative w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-10 animate-in slide-in-from-left duration-300 shadow-2xl">
        <SidebarContent />
      </aside>
    </div>)}

    {/* Main Content */}
    <div className="flex-1 flex flex-col min-w-0 bg-background/50">
      {/* Top bar */}
      <header className="h-16 flex items-center justify-between px-6 lg:px-8 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30 transition-all duration-300">
        <div className="flex items-center gap-4">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          {title && <h1 className="text-xl font-bold heading-font text-foreground tracking-tight">{title}</h1>}
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all shadow-sm border border-transparent hover:border-border">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary ring-2 ring-background animate-pulse" />
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-auto p-6 lg:p-8 animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  </div>);
}
