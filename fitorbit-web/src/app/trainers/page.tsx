import DashboardLayout from "@/components/layout/DashboardLayout";
import { Dumbbell } from "lucide-react";

export default function TrainersPage() {
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
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-md shadow-primary/20 transition-all active:scale-95">
            + Add Trainer
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: "Alex Turner", specialty: "Bodybuilding", members: 12, rating: 4.8 },
            { name: "Jessica Fox", specialty: "Yoga & Pilates", members: 24, rating: 4.9 },
            { name: "Marcus Johnson", specialty: "CrossFit", members: 18, rating: 4.7 },
          ].map((trainer, i) => (
            <div key={i} className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-primary font-bold text-xl ring-2 ring-background shadow-inner">
                  {trainer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{trainer.name}</h3>
                  <p className="text-sm text-primary font-medium">{trainer.specialty}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-secondary/50 p-3 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">Assigned Members</p>
                  <p className="font-bold text-lg">{trainer.members}</p>
                </div>
                <div className="bg-secondary/50 p-3 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">Avg Rating</p>
                  <p className="font-bold text-lg flex items-center gap-1">
                    {trainer.rating} <span className="text-yellow-500 text-sm">★</span>
                  </p>
                </div>
              </div>
              <button className="w-full py-2.5 border border-border rounded-xl text-sm font-medium hover:border-primary hover:text-primary transition-colors">
                View Staff Profile
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
