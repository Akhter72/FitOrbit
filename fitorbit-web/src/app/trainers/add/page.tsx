import DashboardLayout from "@/components/layout/DashboardLayout";
import { Dumbbell, ArrowLeft } from "lucide-react";
import Link from "next/link";
import TrainerForm from "@/components/trainers/TrainerForm";

export default function AddTrainerPage() {
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
              Add New Trainer
            </h1>
            <p className="text-muted-foreground mt-1">
              Register a new coach or staff member to your gym.
            </p>
          </div>
        </div>

        <TrainerForm />
      </div>
    </DashboardLayout>
  );
}
