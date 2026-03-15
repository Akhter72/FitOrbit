import DashboardLayout from "@/components/layout/DashboardLayout";
import { Settings as SettingsIcon, Store, Shield, Bell, CreditCard } from "lucide-react";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 pb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
             <div className="p-2 bg-slate-500/10 rounded-lg">
                <SettingsIcon className="w-6 h-6 text-slate-500" />
              </div>
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your gym profile, security, and notification preferences.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Settings Nav Sidebar */}
          <div className="w-full lg:w-64 flex flex-col gap-2">
            {[
              { name: "General Profile", icon: Store, active: true },
              { name: "Security & Login", icon: Shield, active: false },
              { name: "Notifications", icon: Bell, active: false },
              { name: "Billing & Plans", icon: CreditCard, active: false },
            ].map((tab, i) => (
              <button 
                key={i} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  tab.active 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Settings Content Area */}
          <div className="flex-1 bg-card border border-border rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">General Profile</h2>
            
            <form className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gym Name</label>
                  <input
                    type="text"
                    defaultValue="Apex Fitness"
                    className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Owner Name</label>
                  <input
                    type="text"
                    defaultValue="Admin User"
                    className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <input
                  type="text"
                  defaultValue="123 Fitness Street, New York, NY"
                  className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <label className="text-sm font-medium">Currency Default</label>
                  <select className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary">
                    <option>INR - Indian Rupee (₹)</option>
                    <option>USD - US Dollar ($)</option>
                    <option>EUR - Euro (€)</option>
                    <option>GBP - British Pound (£)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Timezone</label>
                  <select className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary">
                    <option>Asia/Kolkata (IST)</option>
                    <option>America/New_York (EST)</option>
                    <option>Europe/London (GMT)</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-border mt-8 flex justify-end">
                <button type="button" className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-medium shadow-md shadow-primary/20 transition-all active:scale-95">
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
