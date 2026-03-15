import DashboardLayout from "@/components/layout/DashboardLayout";
import { CalendarDays, Filter, Search } from "lucide-react";

export default function AttendancePage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <CalendarDays className="w-6 h-6 text-orange-500" />
              </div>
              Attendance log
            </h1>
            <p className="text-muted-foreground mt-1">
              Track daily check-ins and member activity.
            </p>
          </div>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-md shadow-primary/20 transition-all active:scale-95">
            + Manual Check-in
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-border rounded-xl bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              placeholder="Search check-ins..."
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <input 
              type="date" 
              className="px-4 py-2 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background"
              defaultValue={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Attendance Log */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Member</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Check-in Time</th>
                  <th className="px-6 py-4 font-medium">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {[
                  { name: "John Doe", date: "15 Mar 2026", time: "06:30 AM", method: "QR Scan" },
                  { name: "Sarah Jenkins", date: "15 Mar 2026", time: "07:15 AM", method: "Manual" },
                  { name: "David Kim", date: "15 Mar 2026", time: "08:45 AM", method: "QR Scan" },
                  { name: "Mike Ross", date: "15 Mar 2026", time: "09:00 AM", method: "App" },
                  { name: "Emma Watson", date: "15 Mar 2026", time: "11:30 AM", method: "QR Scan" },
                ].map((log, i) => (
                  <tr key={i} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{log.name}</td>
                    <td className="px-6 py-4">{log.date}</td>
                    <td className="px-6 py-4 text-emerald-500 font-medium">{log.time}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-secondary text-foreground text-xs font-semibold rounded-full border border-border/50">
                        {log.method}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
