import DashboardLayout from "@/components/layout/DashboardLayout";
import { CreditCard, Download, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";

export default function PaymentsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <CreditCard className="w-6 h-6 text-emerald-500" />
              </div>
              Payments
            </h1>
            <p className="text-muted-foreground mt-1">
              Billing history, invoices and revenue tracking.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground px-5 py-2.5 rounded-xl font-medium shadow-sm border border-border transition-all active:scale-95">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-md shadow-primary/20 transition-all active:scale-95">
              + Record Payment
            </button>
          </div>
        </div>

        {/* Payment Stats Blocks */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-muted-foreground font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Collected This Month
            </div>
            <p className="text-3xl font-bold text-foreground">₹35,50,000</p>
          </div>
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-muted-foreground font-medium">
              <Clock className="w-5 h-5 text-orange-500" /> Pending Renewals
            </div>
            <p className="text-3xl font-bold text-foreground">₹2,45,000</p>
          </div>
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-muted-foreground font-medium">
              <ArrowUpRight className="w-5 h-5 text-blue-500" /> Current MRR
            </div>
            <p className="text-3xl font-bold text-foreground">₹38,00,000</p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground rounded-lg">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-l-lg">ID</th>
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium rounded-r-lg text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {[
                  { id: "#TRX-9011", member: "Sarah Jenkins", date: "15 Mar 2026", amount: "₹10,000", method: "UPI", status: "Completed" },
                  { id: "#TRX-9010", member: "John Doe", date: "14 Mar 2026", amount: "₹12,500", method: "Credit Card", status: "Completed" },
                  { id: "#TRX-9009", member: "David Kim", date: "14 Mar 2026", amount: "₹5,000", method: "Bank Transfer", status: "Failed" },
                  { id: "#TRX-9008", member: "Mike Ross", date: "12 Mar 2026", amount: "₹2,000", method: "Cash", status: "Completed" },
                ].map((trx, i) => (
                  <tr key={i} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-4 font-mono text-muted-foreground text-xs">{trx.id}</td>
                    <td className="px-4 py-4 font-medium">{trx.member}</td>
                    <td className="px-4 py-4">{trx.date}</td>
                    <td className="px-4 py-4 font-semibold">{trx.amount}</td>
                    <td className="px-4 py-4">{trx.method}</td>
                    <td className="px-4 py-4 text-right">
                       <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        trx.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {trx.status}
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
