"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import MemberForm from "@/components/members/MemberForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AddMemberPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 pb-10 max-w-5xl mx-auto w-full">

        <div className="flex items-center gap-4">
          <Link href="/members" className="p-2 hover:bg-secondary rounded-xl transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Register New Member</h1>
            <p className="text-muted-foreground mt-1">
              Add a new member to your gym database.
            </p>
          </div>
        </div>

        <MemberForm />

      </div>
    </DashboardLayout>
  );
}
