"use client";

import { Dumbbell, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background text-foreground">
      {/* Left side - Branding & Image */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-secondary/30 relative overflow-hidden">
        {/* Background Decorative Blur */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none"></div>

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
            Manage your gym <br/>
            <span className="text-primary">like a pro.</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            The all-in-one SaaS platform for scaling fitness businesses. Track memberships, handle payments, and manage trainers seamlessly.
          </p>
          <div className="flex items-center gap-4 text-sm font-medium text-foreground">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-10 h-10 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold ${
                  i === 1 ? 'bg-blue-500/20 text-blue-500' : 
                  i === 2 ? 'bg-emerald-500/20 text-emerald-500' : 
                  i === 3 ? 'bg-purple-500/20 text-purple-500' : 
                  'bg-orange-500/20 text-orange-500'
                }`}>
                  U{i}
                </div>
              ))}
            </div>
            <p>Trusted by 1000+ Gyms</p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
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
            <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h2>
            <p className="text-muted-foreground">Please enter your details to sign in.</p>
          </div>

          <form 
            className="space-y-6" 
            onSubmit={(e) => {
              e.preventDefault();
              router.push("/");
            }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="flex h-12 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-shadow hover:shadow-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none" htmlFor="password">
                  Password
                </label>
                <Link href="#" className="text-sm text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="flex h-12 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-shadow hover:shadow-sm"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="remember" 
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary bg-card"
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
              >
                Remember for 30 days
              </label>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]"
            >
              Sign In
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/sign-up" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
