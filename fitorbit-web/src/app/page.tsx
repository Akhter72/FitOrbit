"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Users, CreditCard, Activity, ArrowUpRight, TrendingUp, Loader2, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    monthlyRevenue: 0,
    todayCheckins: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currency, setCurrency] = useState("₹");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    amount: "1500"
  });

  useEffect(() => {
    fetchDashboard();
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user?.gym?.currency) {
         setCurrency(
           user.gym.currency === "USD" ? "$" : 
           user.gym.currency === "EUR" ? "€" : 
           user.gym.currency === "GBP" ? "£" : "₹"
         );
      }
    } catch(e) {}
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecentActivity(data.recentActivity);
      }
    } catch (e) {
      console.error("Dashboard failed to load", e);
    } finally {
      setIsLoading(false);
    }
  };

  const submitMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        setErrorMsg(result.message);
      } else {
        // Success
        setIsModalOpen(false);
        setFormData({ email: "", phone: "", amount: "1500" });
        // Auto refresh dashboard immediately!
        fetchDashboard();
      }
    } catch (err: any) {
      setErrorMsg("Failed to add member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 pb-10 relative">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
            <p className="text-muted-foreground mt-1">
              Here is what's happening in your gym right now.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-md shadow-primary/20 transition-all active:scale-95"
          >
            + Add New Member
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Members" 
            value={stats.totalMembers.toLocaleString()} 
            trend="+0%" 
            trendUp={true}
            icon={Users}
            iconColor="text-blue-500"
            iconBg="bg-blue-500/10"
          />
          <StatCard 
            title="Active Members" 
            value={stats.activeMembers.toLocaleString()} 
            trend="+0%" 
            trendUp={true}
            icon={Activity}
            iconColor="text-emerald-500"
            iconBg="bg-emerald-500/10"
          />
          <StatCard 
            title="Monthly Revenue" 
            value={`${currency}${stats.monthlyRevenue.toLocaleString()}`} 
            trend="+0%" 
            trendUp={true}
            icon={CreditCard}
            iconColor="text-primary"
            iconBg="bg-primary/10"
          />
          <StatCard 
            title="Today's Check-ins" 
            value={stats.todayCheckins.toLocaleString()} 
            trend="+0%" 
            trendUp={true}
            icon={TrendingUp}
            iconColor="text-orange-500"
            iconBg="bg-orange-500/10"
          />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart Placeholder */}
          <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Revenue Analytics</h2>
              <select className="bg-secondary text-sm px-3 py-1.5 rounded-lg border-none focus:ring-0 cursor-pointer outline-none">
                <option>This Month</option>
                <option>Last Month</option>
                <option>This Year</option>
              </select>
            </div>
            {/* Chart Area */}
            <div className="h-72 w-full bg-gradient-to-t from-secondary/50 to-transparent rounded-2xl flex items-center justify-center border border-border/50 border-dashed relative overflow-hidden group">
               <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/10 to-transparent opacity-50"></div>
               <p className="text-muted-foreground text-sm font-medium z-10 flex items-center gap-2 group-hover:scale-110 transition-transform">
                 <Activity className="w-5 h-5 text-primary" />
                 Chart Interface
               </p>
               <div className="absolute bottom-0 w-full flex items-end justify-around px-8 h-full z-0 opacity-40 grayscale">
                 {[40, 70, 45, 90, 65, 80, 55].map((height, i) => (
                   <div key={i} className="w-12 bg-primary rounded-t-lg transition-all duration-1000 ease-in-out hover:opacity-100" style={{ height: `${height}%` }}></div>
                 ))}
               </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <button className="text-sm text-primary hover:underline font-medium">View All</button>
            </div>
            
            <div className="flex-1 flex flex-col gap-5 overflow-y-auto pr-2">
              {recentActivity.length === 0 ? (
                <div className="text-muted-foreground text-sm text-center py-10">
                  No activity yet!
                </div>
              ) : recentActivity.map((activity: any, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 uppercase font-bold
                    ${activity.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}
                  `}>
                    {activity.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {activity.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.action}
                    </p>
                  </div>
                  <div className="text-right">
                    {activity.amount && (
                      <p className={`text-sm font-medium text-emerald-500`}>
                        {activity.amount}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {typeof activity.time === "string" && activity.time !== "Recently" 
                        ? formatDistanceToNow(new Date(activity.time), { addSuffix: true }) 
                        : "Just now"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-3xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border/50 bg-secondary/30">
              <h3 className="text-xl font-semibold">Add New Member</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary/80 text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitMember} className="p-6 space-y-5">
              
              {errorMsg && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm font-medium rounded-xl border border-destructive/20">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Member Email</label>
                <input
                  type="email"
                  required
                  placeholder="member@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full h-11 px-3 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full h-11 px-3 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Initial Payment / Fee</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground font-medium">
                    {currency}
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="1500"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full h-11 pl-8 px-3 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="border-t border-border/50 pt-5 mt-2 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-primary/20 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Register Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}

// Subcomponent for Stats
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StatCard({ title, value, trend, trendUp, icon: Icon, iconColor, iconBg }: any) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border-b-4 hover:border-b-primary">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${iconBg} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500`}></div>
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={`p-3 rounded-2xl ${iconBg}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
          trendUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'
        }`}>
          {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3 rotate-90" />}
          {trend}
        </div>
      </div>
      
      <div className="relative z-10">
        <h3 className="text-muted-foreground text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
      </div>
    </div>
  );
}
