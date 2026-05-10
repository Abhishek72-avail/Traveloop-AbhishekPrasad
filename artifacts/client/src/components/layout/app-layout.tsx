import { Link, useLocation } from "wouter";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { 
  PlaneTakeoff, LayoutDashboard, Map as MapIcon, Settings, 
  MapPin, LogOut, Compass, Users, Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQueryClient } from "@tanstack/react-query";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: user } = useGetMe({ query: { enabled: false, queryKey: ["/api/auth/me"] } }); // Should be cached by AuthGuard
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("traveloop_token");
        queryClient.clear();
        setLocation("/login");
      }
    });
  };

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "My Trips", href: "/trips", icon: MapIcon },
    { name: "Cities", href: "/cities", icon: MapPin },
    { name: "Activities", href: "/activities", icon: Compass },
  ];

  if (user?.role === "admin") {
    navItems.push({ name: "Administration", href: "/admin", icon: Users });
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Header / Navbar */}
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-8 shrink-0 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2 text-primary font-bold text-xl cursor-pointer" onClick={() => setLocation("/")}>
            <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded-md object-cover" />
            <span>Traveloop</span>
          </div>
          
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link key={item.name} href={item.href}>
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full transition-colors cursor-pointer text-sm font-medium",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}>
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-10 w-10 border-2 border-border cursor-pointer hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20">
                <AvatarImage src={user?.avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {user?.name.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-1">
              <div className="px-2 py-1.5 mb-1">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              
              {/* Mobile Navigation inside Dropdown */}
              <div className="md:hidden">
                {navItems.map(item => (
                  <DropdownMenuItem key={item.name} onClick={() => setLocation(item.href)} className="cursor-pointer">
                    <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{item.name}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </div>

              <DropdownMenuItem onClick={() => setLocation("/profile")} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 mt-1">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-muted/10">
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
