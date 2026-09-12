import { useState } from "react";
import { Link } from "react-router-dom";
import useSignUpForm from "../../hooks/useSignUpForm";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Trophy,
} from "lucide-react";

const SignUp = () => {
  const { register, handleSubmit, errors, onSubmit, loading } = useSignUpForm();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 relative z-10">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden glass-panel border border-white/15 shadow-2xl shadow-emerald-500/10 backdrop-blur-2xl">
        
        {/* Left Column: Sports Experience Highlights */}
        <div className="lg:col-span-5 relative hidden lg:flex flex-col justify-between p-8 bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-teal-950/40 border-r border-white/10 overflow-hidden">
          <div className="absolute top-12 -left-12 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-12 -right-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Headline */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Jaipur Player Network</span>
            </div>
            
            <h2 className="text-3xl font-black text-white mt-6 leading-tight">
              Unlock Every <br />
              <span className="text-gradient-emerald">Pitch in Jaipur</span>
            </h2>
            <p className="text-xs text-slate-300/80 mt-2 leading-relaxed">
              Join thousands of football and box cricket athletes in Jaipur. Get instant slot reservations, team management, and match history.
            </p>
          </div>

          {/* Middle Sports Card Showcase */}
          <div className="relative z-10 my-6 rounded-2xl overflow-hidden glass-panel border border-white/10 p-3 shadow-xl group">
            <img
              src="https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=700&q=80"
              alt="Football Turf Jaipur"
              className="w-full h-36 object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
            />
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                <span>10+ Jaipur Locations</span>
              </div>
              <span className="text-cyan-400 font-semibold text-[11px]">
                🌙 Late-Night Matchmaking
              </span>
            </div>
          </div>

          {/* Bottom Perks */}
          <div className="relative z-10 space-y-2 pt-4 border-t border-white/10 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Free instant membership with zero platform fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Direct WhatsApp confirmation & digital QR pass</span>
            </div>
          </div>
        </div>

        {/* Right Column: Sign Up Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center relative">
          <div className="mb-6 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Join The Game ⚡
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Find your turf. Pick your slot. Start playing in Jaipur.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  {...register("name")}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/70 border ${
                    errors.name ? "border-rose-500 ring-1 ring-rose-500" : "border-white/15"
                  } text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all`}
                />
              </div>
              {errors.name && (
                <p className="text-rose-400 text-xs font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="rahul@example.com"
                  {...register("email")}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/70 border ${
                    errors.email ? "border-rose-500 ring-1 ring-rose-500" : "border-white/15"
                  } text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all`}
                />
              </div>
              {errors.email && (
                <p className="text-rose-400 text-xs font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone Number Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">
                Phone Number (WhatsApp Match Alerts)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="+91 98290 12345"
                  {...register("phone")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/70 border border-white/15 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password & Confirm Password Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/70 border ${
                      errors.password ? "border-rose-500 ring-1 ring-rose-500" : "border-white/15"
                    } text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-rose-400 text-xs font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/70 border ${
                      errors.confirmPassword ? "border-rose-500 ring-1 ring-rose-500" : "border-white/15"
                    } text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-rose-400 text-xs font-medium">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="glow-btn w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 mt-3 group shadow-lg shadow-emerald-500/25 disabled:opacity-60"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center mt-5 pt-3 border-t border-white/10 text-xs text-slate-400">
            <span>Already have an account? </span>
            <Link
              to="/login"
              className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors"
            >
              Sign In Here
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SignUp;
