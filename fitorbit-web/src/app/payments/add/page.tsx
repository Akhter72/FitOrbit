"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { CreditCard, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RecordPaymentPage() {
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    userId: "",
    amount: "",
    paymentMethod: "UPI",
    status: "COMPLETED"
  });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("/api/members");
        if (!res.ok) throw new Error("Failed to load members for payment");
        const data = await res.json();
        setMembers(data.members || []);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setIsLoadingMembers(false);
      }
    };
    fetchMembers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: formData.userId,
          amount: parseFloat(formData.amount),
          paymentMethod: formData.paymentMethod,
          status: formData.status
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to record payment");

      router.push("/payments");
      router.refresh(); // Refresh route fully
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 pb-10">
        <div className="flex flex-col gap-4">
          <Link 
            href="/payments" 
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Payments
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <CreditCard className="w-6 h-6 text-emerald-500" />
              </div>
              Record Payment
            </h1>
            <p className="text-muted-foreground mt-1">
              Add a new transaction record for a specific member.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-destructive/10 text-destructive text-sm font-medium rounded-xl border border-destructive/20">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-2xl bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Member *</label>
              <select 
                required
                value={formData.userId}
                onChange={(e) => setFormData({...formData, userId: e.target.value})}
                className="w-full h-11 px-3 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
                disabled={isLoadingMembers || isSubmitting}
              >
                <option value="" disabled>
                  {isLoadingMembers ? "Loading members..." : "Choose a valid member to record payment"}
                </option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.firstName} {m.lastName} ({m.email})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Amount *</label>
              <input 
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="e.g. 5000"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full h-11 px-3 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method *</label>
                <select 
                  required
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  className="w-full h-11 px-3 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  <option value="UPI">UPI</option>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status *</label>
                <select 
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full h-11 px-3 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <Link
              href="/payments"
              className="px-6 py-3 rounded-xl text-sm font-medium bg-secondary hover:bg-secondary/80 border border-border transition-colors pointer-events-auto"
            >
               Cancel
            </Link>
            <button 
              type="submit"
              disabled={isSubmitting || isLoadingMembers}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl text-sm font-medium shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
