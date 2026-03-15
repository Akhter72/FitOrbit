import { Bell, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 h-20 flex items-center justify-between px-8">
      {/* Mobile Menu Button - hidden on desktop */}
      <div className="lg:hidden flex items-center gap-4">
        <span className="text-xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
          FitOrbit
        </span>
      </div>

      {/* Global Search */}
      <div className="hidden lg:flex items-center flex-1 lg:max-w-md ml-auto lg:ml-0">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-border/50 rounded-xl leading-5 bg-card placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm text-foreground transition-shadow shadow-sm hover:shadow-md"
            placeholder="Search members, activities, payments..."
            autoComplete="off"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 ml-auto">
        <button className="relative p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors group">
          <Bell className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background"></span>
        </button>
      </div>
    </header>
  );
}
