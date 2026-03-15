"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Users, CreditCard, Activity, ArrowUpRight, TrendingUp, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    monthlyRevenue: 0,
    todayCheckins: 0,
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currency, setCurrency] = useState("₹");

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
        setRevenueData(data.revenueChart || []);
        setRecentActivity(data.recentActivity || []);
      }
    } catch (e) {
      console.error("Dashboard failed to load", e);
    } finally {
      setIsLoading(false);
    }
  };

  const maxRevenue = Math.max(...revenueData.map(d => d.value), 1); // Avoid div by zero

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
          <Link 
            href="/members/add"
            className="flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-md shadow-primary/20 transition-all active:scale-95"
          >
            + Add New Member
          </Link>
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
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Revenue Analytics</h2>
              <select className="bg-secondary text-sm px-3 py-1.5 rounded-lg border-none focus:ring-0 cursor-pointer outline-none font-medium">
                <option>Last 6 Months</option>
              </select>
            </div>
            
            <div className="h-72 w-full bg-gradient-to-t from-secondary/50 to-transparent rounded-2xl flex items-center justify-center border border-border/50 border-dashed relative overflow-hidden group">
               <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/10 to-transparent opacity-50"></div>
               
               {revenueData.length === 0 ? (
                 <p className="text-muted-foreground text-sm font-medium z-10 flex items-center gap-2">
                   <Activity className="w-5 h-5 text-primary" />
                   No revenue data yet
                 </p>
               ) : (
                <div className="absolute bottom-0 w-full flex items-end justify-around px-2 sm:px-8 h-full z-10 pb-6 pt-10">
                  {revenueData.map((data, i) => {
                    // Min 5% height so the bar always shows a sliver
                    const heightPercent = Math.max((data.value / maxRevenue) * 100, 5);
                    return (
                      <div key={i} className="flex flex-col items-center justify-end h-full">
                        <div className="w-8 sm:w-16 relative group/bar flex items-end justify-center h-full pb-2">
                           {/* Hover tooltip */}
                           <div className="absolute -top-10 bg-foreground text-background text-xs font-bold py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                             {currency}{data.value.toLocaleString()}
                           </div>
                           <div 
                             className={`w-full bg-primary rounded-t-lg transition-all duration-1000 ease-out hover:opacity-80`} 
                             style={{ height: `${heightPercent}%` }}
                           ></div>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground mt-2">{data.label}</span>
                      </div>
                    );
                  })}
                </div>
               )}
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
