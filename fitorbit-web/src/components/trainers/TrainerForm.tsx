"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Camera, UserCircle2 } from "lucide-react";

export default function TrainerForm({ 
  initialData = null, 
  isEditing = false,
  trainerId = null
}: { 
  initialData?: any; 
  isEditing?: boolean;
  trainerId?: string | null;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialization: "",
    profileImage: ""
  });

  useEffect(() => {
    if (initialData && isEditing) {
      setFormData({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        email: initialData.email || "",
        phone: initialData.trainerProfile?.phone || "",
        specialization: initialData.trainerProfile?.specialization || "",
        profileImage: initialData.profileImage || ""
      });
    }
  }, [initialData, isEditing]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const submitTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const url = isEditing && trainerId ? `/api/trainers/${trainerId}` : "/api/trainers";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        setErrorMsg(result.message);
      } else {
        router.push("/trainers");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(`Failed to ${isEditing ? 'edit' : 'register'} trainer.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submitTrainer} className="space-y-8">
      {errorMsg && (
        <div className="p-4 bg-destructive/10 text-destructive text-sm font-medium rounded-2xl border border-destructive/20">
          {errorMsg}
        </div>
      )}

      {/* Profile Image Section */}
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start p-6 bg-card border border-border rounded-3xl shadow-sm">
        <div className="relative group cursor-pointer w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-md bg-secondary flex-shrink-0" onClick={() => fileInputRef.current?.click()}>
          {formData.profileImage ? (
            <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-purple-500/10 text-purple-500">
              <UserCircle2 className="w-16 h-16 opacity-50" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-6 h-6 text-white mb-1" />
            <span className="text-white text-xs font-medium">Upload</span>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Staff Picture</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Upload a professional photo of the trainer. This builds trust with members on their profiles. Max size 2MB.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">Trainer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">First Name *</label>
            <input
              type="text"
              required
              placeholder="Alex"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="w-full h-11 px-3 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Last Name</label>
            <input
              type="text"
              placeholder="Turner"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="w-full h-11 px-3 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address *</label>
            <input
              type="email"
              required
              placeholder="trainer@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full h-11 px-3 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full h-11 px-3 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Specialization</label>
            <input
              type="text"
              placeholder="e.g. Bodybuilding, Yoga & Pilates, CrossFit"
              value={formData.specialization}
              onChange={(e) => setFormData({...formData, specialization: e.target.value})}
              className="w-full h-11 px-3 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8 pb-10">
        <button 
          type="button"
          onClick={() => router.push("/trainers")}
          disabled={isSubmitting}
          className="px-6 py-3 rounded-xl text-sm font-medium bg-card border border-border hover:bg-secondary transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl text-sm font-medium shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEditing ? "Save Changes" : "Register Trainer"}
        </button>
      </div>

    </form>
  );
}
