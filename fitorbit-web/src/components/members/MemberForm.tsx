"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Camera, UserCircle2 } from "lucide-react";

export default function MemberForm({ 
  initialData = null, 
  isEditing = false,
  memberId = null
}: { 
  initialData?: any; 
  isEditing?: boolean;
  memberId?: string | null;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [currency, setCurrency] = useState("₹");
  const [plans, setPlans] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    profileImage: "",
    amount: "1500",
    planId: ""
  });

  useEffect(() => {
    fetchPlans();
    
    // Check locally for currency logic
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

    // Pre-fill
    if (initialData && isEditing) {
      setFormData({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        email: initialData.email || "",
        phone: initialData.memberProfile?.phone || "",
        gender: initialData.memberProfile?.gender || "",
        dateOfBirth: initialData.memberProfile?.dateOfBirth 
          ? new Date(initialData.memberProfile.dateOfBirth).toISOString().split('T')[0] 
          : "",
        address: initialData.memberProfile?.address || "",
        profileImage: initialData.profileImage || "",
        amount: "0",
        planId: initialData.memberProfile?.planId || ""
      });
    }
  }, [initialData, isEditing]);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
      }
    } catch (e) {}
  };

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

  const submitMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const url = isEditing && memberId ? `/api/members/${memberId}` : "/api/members";
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
        router.push("/members"); // Go back to members list and refresh
        router.refresh(); // Tell Next14 to refresh server components
      }
    } catch (err: any) {
      setErrorMsg(`Failed to ${isEditing ? 'edit' : 'register'} member.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submitMember} className="space-y-8">
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
            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
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
          <h3 className="text-lg font-semibold">Profile Picture</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Upload a high-quality photo of the member. This will be used for attendance and identification. Max size 2MB.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">First Name *</label>
            <input
              type="text"
              required
              placeholder="John"
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
              placeholder="Doe"
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
              placeholder="member@example.com"
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
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              className="w-full h-11 px-3 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
              disabled={isSubmitting}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Date of Birth</label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
              className="w-full h-11 px-3 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Home Address</label>
            <input
              type="text"
              placeholder="123 Fitness Street, Gym City..."
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full h-11 px-3 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">Membership Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Subscribed Plan</label>
            <select
              value={formData.planId}
              onChange={(e) => {
                const pId = e.target.value;
                setFormData({...formData, planId: pId});
                if (!isEditing) {
                  const selectedPlan = plans.find(p => p.id === pId);
                  if (selectedPlan) {
                    setFormData(prev => ({...prev, amount: selectedPlan.price.toString()}));
                  }
                }
              }}
              className="w-full h-11 px-3 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
              disabled={isSubmitting}
            >
              <option value="">No specific plan (Custom)</option>
              {plans.map(p => (
                <option key={p.id} value={p.id}>{p.name} - {currency}{p.price}</option>
              ))}
            </select>
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Initial Payment / Fee *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground font-medium">
                  {currency}
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="1500"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full h-11 pl-8 px-3 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8 pb-10">
        <button 
          type="button"
          onClick={() => router.push("/members")}
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
          {isEditing ? "Save Changes" : "Register Member"}
        </button>
      </div>

    </form>
  );
}
