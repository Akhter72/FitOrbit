"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MemberForm from "@/components/members/MemberForm";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EditMemberPage() {
  const params = useParams();
  const [member, setMember] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await fetch(`/api/members/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setMember(data.member);
        }
      } catch (e) {
        console.error("Failed to load member");
      } finally {
        setIsLoading(false);
      }
    };

    if (params?.id) {
      fetchMember();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!member) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-muted-foreground">Member not found.</p>
          <Link href="/members" className="text-primary hover:underline">Return to Members List</Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 pb-10 max-w-5xl mx-auto w-full">
        
        <div className="flex items-center gap-4">
          <Link href="/members" className="p-2 hover:bg-secondary rounded-xl transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Member Details</h1>
            <p className="text-muted-foreground mt-1">
              Update the profile for {member.firstName || member.lastName ? `${member.firstName} ${member.lastName}` : member.email}.
            </p>
          </div>
        </div>

        <MemberForm 
          initialData={member}
          isEditing={true}
          memberId={member.id}
        />

      </div>
    </DashboardLayout>
  );
}
