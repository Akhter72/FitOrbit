"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Settings as SettingsIcon, Store, Shield, Bell, CreditCard, Loader2, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("General Profile");
  
  // General Profile State
  const [gym, setGym] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Security State
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [securityMessage, setSecurityMessage] = useState("");
  const [securityError, setSecurityError] = useState("");

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

  const handleGeneralSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSavingSecurity(true);
    setSecurityMessage("");
    setSecurityError("");

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    if (newPassword !== confirmPassword) {
      setSecurityError("New passwords do not match.");
      setIsSavingSecurity(false);
      return;
    }

    try {
      const res = await fetch("/api/settings/security", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Failed to update password");
      
      setSecurityMessage("Password updated securely!");
      (e.target as HTMLFormElement).reset();

      setTimeout(() => setSecurityMessage(""), 3000);
    } catch (err: any) {
      setSecurityError(err.message);
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const tabs = [
    { name: "General Profile", icon: Store },
    { name: "Security & Login", icon: Shield },
    { name: "Notifications", icon: Bell },
    { name: "Billing & Plans", icon: CreditCard },
  ];

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
          <div className="w-full lg:w-64 flex flex-col gap-2 shrink-0">
            {tabs.map((tab, i) => (
              <button 
                key={i} 
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                  activeTab === tab.name 
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
          <div className="flex-1 bg-card border border-border rounded-3xl p-8 shadow-sm overflow-hidden min-h-[500px]">
            
            {activeTab === "General Profile" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Store className="w-5 h-5 text-primary" />
                  General Profile
                </h2>
                
                {isLoading ? (
                  <div className="flex justify-center flex-col items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground text-sm font-medium">Loading settings...</p>
                  </div>
                ) : gym ? (
                  <form className="space-y-6 max-w-2xl" onSubmit={handleGeneralSubmit}>
                    {message && (
                      <div className="p-4 flex items-center gap-3 text-sm font-medium bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
                        <CheckCircle2 className="w-5 h-5" />
                        {message}
                      </div>
                    )}
                    {error && (
                      <div className="p-4 text-sm font-medium bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
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
                      <label className="text-sm font-medium">Location Address</label>
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
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isSaving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="py-20 text-center text-muted-foreground font-medium">
                    Failed to load profile.
                  </div>
                )}
              </div>
            )}

            {activeTab === "Security & Login" && (
               <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                     <Shield className="w-5 h-5 text-indigo-500" />
                     Security & Login
                  </h2>
                  <p className="text-muted-foreground text-sm mb-8 max-w-lg">
                    Manage your administrator login credentials and account access. Ensure your gym's data is heavily protected.
                  </p>
                  
                  <form className="space-y-6 max-w-xl" onSubmit={handleSecuritySubmit}>
                    {securityMessage && (
                      <div className="p-4 flex items-center gap-3 text-sm font-medium bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
                        <CheckCircle2 className="w-5 h-5" />
                        {securityMessage}
                      </div>
                    )}
                    {securityError && (
                      <div className="p-4 text-sm font-medium bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
                        {securityError}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Current Password</label>
                        <input
                          name="currentPassword"
                          type="password"
                          required
                          placeholder="••••••••"
                          className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 transition-shadow hover:shadow-sm"
                          disabled={isSavingSecurity}
                        />
                      </div>
                      
                      <div className="h-px bg-border my-6 hidden"></div>

                      <div className="space-y-2 mt-4 pt-4 border-t border-border/50">
                        <label className="text-sm font-medium">New Password</label>
                        <input
                          name="newPassword"
                          type="password"
                          required
                          placeholder="Enter entirely new password"
                          className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 transition-shadow hover:shadow-sm"
                          disabled={isSavingSecurity}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Confirm New Password</label>
                        <input
                          name="confirmPassword"
                          type="password"
                          required
                          placeholder="Re-type new password"
                          className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 transition-shadow hover:shadow-sm"
                          disabled={isSavingSecurity}
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border mt-8 flex justify-end">
                      <button 
                        type="submit" 
                        disabled={isSavingSecurity}
                        className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-md shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                      >
                        {isSavingSecurity && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isSavingSecurity ? "Encrypting..." : "Update Password"}
                      </button>
                    </div>
                  </form>
               </div>
            )}

            {activeTab === "Notifications" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 py-20 text-center flex flex-col items-center justify-center">
                   <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-4">
                      <Bell className="w-8 h-8 text-orange-500" />
                   </div>
                   <h3 className="text-xl font-bold mb-2">Notification Preferences</h3>
                   <p className="text-muted-foreground mb-6 max-w-sm">
                     Settings for email reminders, member renewal alerts, and daily summaries will be available here soon.
                   </p>
                </div>
            )}

            {activeTab === "Billing & Plans" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 py-20 text-center flex flex-col items-center justify-center">
                   <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                      <CreditCard className="w-8 h-8 text-blue-500" />
                   </div>
                   <h3 className="text-xl font-bold mb-2">FitOrbit Subscription</h3>
                   <p className="text-muted-foreground mb-6 max-w-sm">
                     You are currently on the trial plan. Options to upgrade your SaaS account and access premium features will appear here.
                   </p>
                </div>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
