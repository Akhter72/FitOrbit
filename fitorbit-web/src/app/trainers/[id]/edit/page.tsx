"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Dumbbell, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import TrainerForm from "@/components/trainers/TrainerForm";

export default function EditTrainerPage() {
  const params = useParams();
  const id = params.id as string;
  const [trainer, setTrainer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        const res = await fetch(`/api/trainers/${id}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || "Failed to load trainer");
        
        setTrainer(data.trainer);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) fetchTrainer();
  }, [id]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 pb-10">
        <div className="flex flex-col gap-4">
          <Link 
            href="/trainers" 
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Trainers
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Dumbbell className="w-6 h-6 text-purple-500" />
              </div>
              Edit Trainer
            </h1>
            <p className="text-muted-foreground mt-1">
              Update coaching staff records and specializations.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : errorMsg ? (
          <div className="p-6 bg-destructive/10 text-destructive font-medium rounded-2xl border border-destructive/20 text-center">
            {errorMsg}
          </div>
        ) : (
          <TrainerForm initialData={trainer} isEditing={true} trainerId={id} />
        )}
      </div>
    </DashboardLayout>
  );
}
