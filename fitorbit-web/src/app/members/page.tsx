"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Users, Search, Filter, Loader2, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Link from "next/link";

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/members");
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch (e) {
      console.error("Failed to load members", e);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMember = async () => {
    if (!memberToDelete) return;
    try {
      const res = await fetch(`/api/members/${memberToDelete}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        setMemberToDelete(null);
        fetchMembers();
      } else {
        alert("Failed to delete member");
      }
    } catch (e) {
      alert("Error deleting member");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 pb-10 relative">
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
          <Link 
            href="/members/add"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-md shadow-primary/20 transition-all active:scale-95 text-center"
          >
            + Add New Member
          </Link>
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
              placeholder="Search members by email or phone..."
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <select className="px-4 py-2 border border-border bg-background rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:bg-secondary cursor-pointer">
              <option>All Status</option>
              <option>Active</option>
              <option>Expired</option>
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
                  <th className="px-6 py-4 font-medium">Phone</th>
                  <th className="px-6 py-4 font-medium hidden md:table-cell">Status</th>
                  <th className="px-6 py-4 font-medium hidden lg:table-cell">Expiry</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No members found. Add a member to get started!
                    </td>
                  </tr>
                ) : (
                  members.map((member, i) => {
                    const profile = member.memberProfile;
                    const isExpired = profile?.expiryDate ? new Date(profile.expiryDate) < new Date() : false;
                    const status = isExpired ? "Expired" : "Active";
                    
                    return (
                      <tr key={i} className="hover:bg-secondary/20 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold uppercase
                              ${isExpired ? 'bg-destructive/10 text-destructive' : 'bg-blue-500/10 text-blue-500'}
                            `}>
                              {member.email.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                                {member.firstName || member.lastName ? `${member.firstName} ${member.lastName}` : member.email.split('@')[0]}
                              </p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-muted-foreground">
                          {profile?.phone || "N/A"}
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell text-muted-foreground">
                          {profile?.expiryDate ? format(new Date(profile.expiryDate), "dd MMM yyyy") : "-"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link 
                              href={`/members/${member.id}/edit`}
                              className="p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors flex items-center justify-center" title="Edit Member"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button 
                              onClick={() => {
                                setMemberToDelete(member.id);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors" title="Delete Member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="p-4 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground bg-secondary/20">
            <p>Showing 1 to {members.length} members</p>
            <div className="flex gap-1">
              <button className="px-3 py-1 border border-border rounded-md hover:bg-secondary disabled:opacity-50" disabled>Prev</button>
              <button className="px-3 py-1 border border-border rounded-md hover:bg-secondary disabled:opacity-50" disabled>Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setMemberToDelete(null);
        }}
        onConfirm={deleteMember}
        title="Delete Member"
        description="Are you sure you want to completely remove this member? This action will permanently delete their profile, attendance logs, and payment records. This cannot be undone."
        confirmText="Yes, delete member"
        cancelText="Cancel"
        variant="danger"
      />

    </DashboardLayout>
  );
}
