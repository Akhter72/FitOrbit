"use client";

import { Dumbbell, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");

    try {
      // In a real application, you would create a POST endpoint at /api/auth/forgot-password
      // which handles generating a password reset token and sending an email.
      // For this step, we will immediately show the success state for UX simulation.
      
      // await fetch("/api/auth/forgot-password", { ... })
      
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network request
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background text-foreground">
      {/* Left side - Branding & Image */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-secondary/30 relative overflow-hidden">
        {/* Background Decorative Blur */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-500/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg ring-1 ring-primary/50">
              <Dumbbell className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">FitOrbit</span>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight">
            Lost your key? <br/>
            <span className="text-primary">We've got you.</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Don't worry, even the strongest lifters forget things sometimes. We will send you instructions to reset your password and get you back into the dashboard.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex items-center justify-center p-8 sm:p-12 lg:p-24 relative z-10">
        <div className="w-full max-w-md space-y-8">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold">
              <Dumbbell className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">FitOrbit</span>
          </div>

          <div>
             <Link href="/sign-in" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
            </Link>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Reset password</h2>
            <p className="text-muted-foreground">Enter the email associated with your account and we'll send you a password reset link.</p>
          </div>

          {success ? (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Check your inbox</h3>
              <p className="text-sm text-muted-foreground px-4">
                We've sent a password reset link to your email address. Please click the link to choose a new password.
              </p>
              <div className="pt-4">
                <Link href="/sign-in" className="text-sm font-medium text-primary hover:underline">
                  Return to sign in
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 text-sm font-medium bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  className="flex h-12 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-shadow hover:shadow-sm"
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  <>
                    Send reset link
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
