import React from "react";
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  IndianRupee,
  ShieldAlert,
  AlertTriangle,
  X,
} from "lucide-react";

const MockPaymentModal = ({
  isOpen,
  onClose,
  orderData,
  onSimulateSuccess,
  onSimulateFailure,
  isProcessing,
}) => {
  if (!isOpen || !orderData) return null;

  const { turfName, date, startTime, endTime, duration, amount, orderId } = orderData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel bg-slate-900/95 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 space-y-6 animate-scale-up">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Development Badge & Header */}
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-500/10">
            <FlaskConical className="w-4 h-4 animate-pulse" />
            <span>Test Payment Simulator</span>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            Development <span className="text-gradient-emerald">Payment Mode</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            This is a test booking simulation. No real money will be charged to any card or account.
          </p>
        </div>

        {/* Booking Summary Box */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs text-slate-400 font-medium">Turf</span>
            <span className="text-sm font-bold text-white text-right">{turfName || "Turf Arena"}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{date || "Today"}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{startTime} - {endTime} ({duration} hr)</span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-400">Order ID: <span className="font-mono text-slate-500 text-[10px]">{orderId}</span></span>
            <div className="flex items-center gap-1 text-lg font-black text-emerald-400">
              <IndianRupee className="w-4 h-4" />
              <span>{amount}</span>
            </div>
          </div>
        </div>

        {/* Temporary Lock Notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            This slot is temporarily held for 10 minutes. Simulating success will lock it in MongoDB; simulating failure will release it.
          </span>
        </div>

        {/* Simulation Actions */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onSimulateSuccess}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {isProcessing ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulate Successful Payment</span>
              </>
            )}
          </button>

          <button
            onClick={onSimulateFailure}
            disabled={isProcessing}
            className="w-full py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            <span>Simulate Failed Payment</span>
          </button>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-full text-center text-xs text-slate-500 hover:text-slate-400 font-medium py-1 transition-colors"
          >
            Cancel & Release Slot
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockPaymentModal;
