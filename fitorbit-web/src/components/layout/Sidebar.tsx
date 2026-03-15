import { 
  LayoutDashboard, 
  Users, 
  Dumbbell, 
  CalendarDays, 
  CreditCard, 
  Settings,
  Bell,
  LogOut,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Members", href: "/members", icon: Users },
  { name: "Trainers", href: "/trainers", icon: Dumbbell },
  { name: "Attendance", href: "/attendance", icon: CalendarDays },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-card border-r border-border shadow-sm">
      {/* Brand */}
      <div className="flex items-center h-20 px-8 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20 ring-1 ring-primary/50">
            F
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            FitOrbit
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col py-6 px-4 gap-1 overflow-y-auto">
        <div className="px-4 pb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Main Menu
          </p>
        </div>
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
              item.name === "Dashboard"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            }`}
          >
            <item.icon
              className={`w-5 h-5 transition-colors ${
                item.name === "Dashboard"
                  ? "text-primary"
                  : "text-muted-foreground group-hover:text-foreground"
              }`}
            />
            {item.name}
            {item.name === "Dashboard" && (
              <ChevronRight className="w-4 h-4 ml-auto text-primary" />
            )}
          </Link>
        ))}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/30 hover:bg-secondary transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            A
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate text-foreground">
              Admin User
            </p>
            <p className="text-xs truncate text-muted-foreground">
              admin@fitorbit.com
            </p>
          </div>
          <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors ml-auto" />
        </div>
      </div>
    </div>
  );
}
