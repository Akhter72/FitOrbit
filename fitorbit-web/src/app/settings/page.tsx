"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Settings as SettingsIcon, Store, Shield, Bell, CreditCard, Loader2, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [gym, setGym] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/settings/profile");
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();
      setGym(data.gym);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save changes");
      
      const result = await res.json();
      setGym(result.gym);
      setMessage(result.message);

      // clear success message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

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
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : gym ? (
              <form className="space-y-6 max-w-2xl" onSubmit={handleSubmit}>
                {message && (
                  <div className="p-4 flex items-center gap-3 text-sm font-medium bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                    {message}
                  </div>
                )}
                {error && (
                  <div className="p-3 text-sm font-medium bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Gym Name</label>
                    <input
                      name="name"
                      type="text"
                      defaultValue={gym.name}
                      required
                      className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Owner Name</label>
                    <input
                      name="ownerName"
                      type="text"
                      defaultValue={gym.ownerName || ""}
                      className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <input
                    name="location"
                    type="text"
                    defaultValue={gym.location || ""}
                    className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
                    disabled={isSaving}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="text-sm font-medium">Currency Default</label>
                    <select 
                      name="currency" 
                      defaultValue={gym.currency || "INR"}
                      className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
                      disabled={isSaving}
                    >
                      <option value="INR">INR - Indian Rupee (₹)</option>
                      <option value="USD">USD - US Dollar ($)</option>
                      <option value="EUR">EUR - Euro (€)</option>
                      <option value="GBP">GBP - British Pound (£)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Timezone</label>
                    <select 
                      name="timezone" 
                      defaultValue={gym.timezone || "Asia/Kolkata"}
                      className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
                      disabled={isSaving}
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-border mt-8 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-medium shadow-md shadow-primary/20 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
                <div className="p-4 text-center text-muted-foreground">
                  Failed to load profile.
                </div>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
