import DashboardLayout from "@/components/layout/DashboardLayout";
import { Users, Search, Filter, MoreHorizontal } from "lucide-react";

export default function MembersPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              Members
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your gym members, plans, and profiles.
            </p>
          </div>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-md shadow-primary/20 transition-all active:scale-95">
            + Add New Member
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
              placeholder="Search members by name, email or phone..."
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <select className="px-4 py-2 border border-border bg-background rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:bg-secondary cursor-pointer">
              <option>All Plans</option>
              <option>Monthly - ₹2,000</option>
              <option>Quarterly - ₹5,500</option>
              <option>Yearly - ₹20,000</option>
            </select>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Member</th>
                  <th className="px-6 py-4 font-medium">Plan</th>
                  <th className="px-6 py-4 font-medium hidden md:table-cell">Status</th>
                  <th className="px-6 py-4 font-medium hidden lg:table-cell">Expiry</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {[
                  { name: "John Doe", email: "john@example.com", plan: "Quarterly", status: "Active", expiry: "12 Oct 2026", color: "text-blue-500", bg: "bg-blue-500/10" },
                  { name: "Sarah Jenkins", email: "sarah@example.com", plan: "Yearly", status: "Active", expiry: "05 Nov 2026", color: "text-purple-500", bg: "bg-purple-500/10" },
                  { name: "Mike Ross", email: "mike@example.com", plan: "Monthly", status: "Expired", expiry: "10 Mar 2026", color: "text-destructive", bg: "bg-destructive/10" },
                  { name: "Emma Watson", email: "emma@example.com", plan: "Monthly", status: "Active", expiry: "28 Apr 2026", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { name: "David Kim", email: "david@example.com", plan: "Yearly", status: "Pending", expiry: "-", color: "text-orange-500", bg: "bg-orange-500/10" },
                ].map((member, i) => (
                  <tr key={i} className="hover:bg-secondary/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${member.bg} ${member.color}`}>
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{member.plan}</td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        member.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 
                        member.status === 'Expired' ? 'bg-destructive/10 text-destructive' : 
                        'bg-orange-500/10 text-orange-500'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-muted-foreground">{member.expiry}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-lg transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Placeholder */}
          <div className="p-4 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground bg-secondary/20">
            <p>Showing 1 to 5 of 1,248 members</p>
            <div className="flex gap-1">
              <button className="px-3 py-1 border border-border rounded-md hover:bg-secondary disabled:opacity-50" disabled>Prev</button>
              <button className="px-3 py-1 border border-border rounded-md hover:bg-secondary">Next</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
