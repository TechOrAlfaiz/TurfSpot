import { useState } from "react";
import { Link } from "react-router-dom";
import useLoginForm from "../../hooks/useLoginForm";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Trophy,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const Login = () => {
  const { register, handleSubmit, errors, onSubmit, loading } = useLoginForm();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 relative z-10">
      {/* Centered Modern 2-Column Sports-Tech Card */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden glass-panel border border-white/15 shadow-2xl shadow-emerald-500/10 backdrop-blur-2xl">
        
        {/* Left Column: Premium Sports-Tech Visual Showcase */}
        <div className="lg:col-span-5 relative hidden lg:flex flex-col justify-between p-8 bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-emerald-950/40 border-r border-white/10 overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute top-10 -left-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 -right-10 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Pill Tag */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Jaipur Turf Booking</span>
            </div>
            
            <h2 className="text-3xl font-black text-white mt-6 leading-tight">
              Ready to <br />
              <span className="text-gradient-emerald">Play Tonight?</span>
            </h2>
            <p className="text-xs text-slate-300/80 mt-2 leading-relaxed">
              Book certified box cricket grounds and floodlit football pitches in Vaishali Nagar, Mansarovar, Malviya Nagar & across Jaipur in under 60 seconds.
            </p>
          </div>

          {/* Middle Sports Visual Card */}
          <div className="relative z-10 my-8 rounded-2xl overflow-hidden glass-panel border border-white/10 p-3 shadow-xl group">
            <img
              src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=700&q=80"
              alt="Cricket Under Floodlights"
              className="w-full h-36 object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
            />
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Jaipur Box Leagues</span>
              </div>
              <span className="text-emerald-400 font-semibold text-[11px]">
                ⚡ Instant QR Access
              </span>
            </div>
          </div>

          {/* Bottom Trust Indicators */}
          <div className="relative z-10 space-y-2 pt-4 border-t border-white/10 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero cancellation fee up to 4 hrs before slot</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% verified turf pitch quality in Jaipur</span>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Glass Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center relative">
          <div className="mb-6 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome Back 👋
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Sign in to manage bookings and secure your match slots.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/70 border ${
                    errors.email ? "border-rose-500 ring-1 ring-rose-500" : "border-white/15"
                  } text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all`}
                />
              </div>
              {errors.email && (
                <p className="text-rose-400 text-xs mt-1 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field with Visibility Toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {}}
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={`w-full pl-10 pr-11 py-3 rounded-xl bg-slate-900/70 border ${
                    errors.password ? "border-rose-500 ring-1 ring-rose-500" : "border-white/15"
                  } text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-rose-400 text-xs mt-1 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button with Loading State */}
            <button
              type="submit"
              disabled={loading}
              className="glow-btn w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 mt-2 group shadow-lg shadow-emerald-500/25 disabled:opacity-60"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  <span>Signing In...</span>
                </div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center mt-6 pt-4 border-t border-white/10 text-xs text-slate-400">
            <span>Don't have an account? </span>
            <Link
              to="/signup"
              className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors"
            >
              Sign Up Now
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
