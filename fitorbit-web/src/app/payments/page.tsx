"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { CreditCard, Download, ArrowUpRight, CheckCircle2, Clock, Loader2 } from "lucide-react";
import Link from "next/link";

export default function PaymentsPage() {
  const [paymentsData, setPaymentsData] = useState<any>({ stats: null, transactions: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [currency, setCurrency] = useState("₹");

  useEffect(() => {
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

    const fetchPayments = async () => {
      try {
        const res = await fetch("/api/payments");
        if (!res.ok) throw new Error("Failed to fetch payments data");
        const data = await res.json();
        setPaymentsData(data);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayments();
  }, []);

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
            <Link 
              href="/payments/add"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-md shadow-primary/20 transition-all active:scale-95 flex items-center"
            >
              + Record Payment
            </Link>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-destructive/10 text-destructive text-sm font-medium rounded-xl border border-destructive/20">
            {errorMsg}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Payment Stats Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2 text-muted-foreground font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Collected This Month
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {currency}{paymentsData.stats?.collectedThisMonth?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2 text-muted-foreground font-medium">
                  <Clock className="w-5 h-5 text-orange-500" /> Pending Renewals
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {currency}{paymentsData.stats?.pendingRenewals?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2 text-muted-foreground font-medium">
                  <ArrowUpRight className="w-5 h-5 text-blue-500" /> Current MRR
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {currency}{paymentsData.stats?.currentMRR?.toLocaleString() || '0'}
                </p>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-6">Recent Transactions</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-secondary/50 text-muted-foreground rounded-lg whitespace-nowrap">
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
                    {paymentsData.transactions?.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                          No transactions found. Record your first payment!
                        </td>
                      </tr>
                    ) : (
                      paymentsData.transactions?.map((trx: any) => (
                        <tr key={trx.rawId} className="hover:bg-secondary/20 transition-colors whitespace-nowrap">
                          <td className="px-4 py-4 font-mono text-muted-foreground text-xs">{trx.id}</td>
                          <td className="px-4 py-4 font-medium">{trx.member}</td>
                          <td className="px-4 py-4">{trx.date}</td>
                          <td className="px-4 py-4 font-semibold">{currency}{parseFloat(trx.amount).toLocaleString()}</td>
                          <td className="px-4 py-4">{trx.method}</td>
                          <td className="px-4 py-4 text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              trx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 
                              trx.status === 'FAILED' ? 'bg-destructive/10 text-destructive' :
                              'bg-orange-500/10 text-orange-500'
                            }`}>
                              {trx.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
