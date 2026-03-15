import DashboardLayout from "@/components/layout/DashboardLayout";
import { Users, CreditCard, Activity, ArrowUpRight, TrendingUp } from "lucide-react";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
            <p className="text-muted-foreground mt-1">
              Here is what's happening in your gym today.
            </p>
          </div>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-md shadow-primary/20 transition-all active:scale-95">
            + Add New Member
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Members" 
            value="1,248" 
            trend="+12%" 
            trendUp={true}
            icon={Users}
            iconColor="text-blue-500"
            iconBg="bg-blue-500/10"
          />
          <StatCard 
            title="Active Members" 
            value="982" 
            trend="+5%" 
            trendUp={true}
            icon={Activity}
            iconColor="text-emerald-500"
            iconBg="bg-emerald-500/10"
          />
          <StatCard 
            title="Monthly Revenue" 
            value="$42,500" 
            trend="+18%" 
            trendUp={true}
            icon={CreditCard}
            iconColor="text-primary"
            iconBg="bg-primary/10"
          />
          <StatCard 
            title="Today's Check-ins" 
            value="342" 
            trend="-2%" 
            trendUp={false}
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
               {/* Simulating some bars */}
               <div className="absolute bottom-0 w-full flex items-end justify-around px-8 h-full z-0 opacity-40 grayscale">
                 {[40, 70, 45, 90, 65, 80, 55].map((height, i) => (
                   <div key={i} className="w-12 bg-primary rounded-t-md transition-all duration-1000 ease-in-out hover:opacity-100" style={{ height: `${height}%` }}></div>
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
              {[
                { name: "Sarah Jenkins", action: "Renewed Membership", time: "2 hours ago", amount: "+$120", type: "success" },
                { name: "Mike Ross", action: "Joined Gym", time: "4 hours ago", amount: "+$150", type: "success" },
                { name: "David Kim", action: "Payment Failed", time: "5 hours ago", amount: "-$60", type: "error" },
                { name: "Emma Watson", action: "Checked in", time: "6 hours ago", amount: "", type: "neutral" },
                { name: "John Doe", action: "Joined Gym", time: "8 hours ago", amount: "+$150", type: "success" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 
                    activity.type === 'error' ? 'bg-destructive/10 text-destructive' : 
                    'bg-secondary text-foreground'
                  }`}>
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
                      <p className={`text-sm font-medium ${activity.type === 'error' ? 'text-destructive' : 'text-emerald-500'}`}>
                        {activity.amount}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
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
      {/* Decorative background element */}
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
