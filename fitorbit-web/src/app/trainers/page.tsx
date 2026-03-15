"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Dumbbell, Loader2, UserCircle2, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState("");
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [trainerToDelete, setTrainerToDelete] = useState<any>(null);

  const fetchTrainers = async () => {
    try {
      const res = await fetch("/api/trainers");
      if (!res.ok) throw new Error("Failed to fetch trainers");
      
      const data = await res.json();
      setTrainers(data.trainers || []);
    } catch (e: any) {
      setErrorStatus(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const handleDeleteClick = (trainer: any) => {
    setTrainerToDelete(trainer);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!trainerToDelete) return;

    try {
      const res = await fetch(`/api/trainers/${trainerToDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        setTrainers(trainers.filter(t => t.id !== trainerToDelete.id));
      }
    } catch (e) {
      console.error("Failed to delete trainer", e);
    } finally {
      setIsDeleteModalOpen(false);
      setTrainerToDelete(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Dumbbell className="w-6 h-6 text-purple-500" />
              </div>
              Trainers
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your coaching staff and their assigned members.
            </p>
          </div>
          <Link 
            href="/trainers/add"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-md shadow-primary/20 transition-all active:scale-95 flex items-center justify-center"
          >
            + Add Trainer
          </Link>
        </div>

        {errorStatus && (
          <div className="p-4 bg-destructive/10 text-destructive text-sm font-medium rounded-xl border border-destructive/20 text-center">
            {errorStatus}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : trainers.length === 0 && !errorStatus ? (
          <div className="bg-card w-full py-20 border border-border border-dashed rounded-3xl flex flex-col items-center justify-center text-center px-4">
             <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
                <Dumbbell className="w-8 h-8 text-purple-500" />
             </div>
             <h3 className="text-xl font-bold mb-2">No trainers yet</h3>
             <p className="text-muted-foreground mb-6 max-w-sm">
               You haven't hired any coaching staff yet. Adding a trainer helps you organize personal training.
             </p>
             <Link 
              href="/trainers/add"
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
            >
               Hire a Trainer
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.map((trainer) => (
              <div key={trainer.id} className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group relative">
                
                {/* Actions overlay */}
                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Link 
                    href={`/trainers/${trainer.id}/edit`}
                    className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors hover:shadow-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => handleDeleteClick(trainer)}
                    className="w-8 h-8 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive hover:bg-destructive hover:text-white transition-colors hover:shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-secondary shadow-md border-4 border-background flex items-center justify-center">
                       {trainer.profileImage ? (
                         <img src={trainer.profileImage} alt="Profile" className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary flex items-center justify-center font-bold text-2xl uppercase shadow-inner">
                           {trainer.firstName.charAt(0)}
                         </div>
                       )}
                    </div>
                    <div className="flex-1 min-w-0 pr-12">
                      <h3 className="font-semibold text-lg truncate whitespace-nowrap text-foreground">
                        {trainer.firstName} {trainer.lastName}
                      </h3>
                      <p className="text-sm font-medium bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent truncate">
                        {trainer.trainerProfile?.specialization || "No Speciality"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-secondary/50 to-secondary/30 border border-border/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:border-border transition-colors">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Assigned</p>
                      <p className="font-bold text-2xl text-foreground">{trainer.assignedMembers}</p>
                    </div>
                    <div className="bg-gradient-to-br from-secondary/50 to-secondary/30 border border-border/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:border-border transition-colors">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Contact</p>
                      <p className="text-xs font-semibold text-foreground truncate max-w-full" title={trainer.trainerProfile?.phone || trainer.email}>
                        {trainer.trainerProfile?.phone || "No Phone"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-secondary/30 border-t border-border/50 p-4">
                  <p className="text-xs text-muted-foreground text-center truncate px-2" title={trainer.email}>
                    {trainer.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Remove Staff Member"
        description={`Are you deeply sure you want to permanently fire and remove ${trainerToDelete?.firstName} ${trainerToDelete?.lastName}? This terminates all member assignments permanently.`}
        confirmText="Yes, Fire Trainer"
        cancelText="Cancel"
        variant="danger"
      />
    </DashboardLayout>
  );
}
