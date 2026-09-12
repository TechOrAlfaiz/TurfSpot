import React from "react";
import CountUp from "react-countup";

const StatCard = ({ title, value, icon: Icon, prefix = "", accentColor = "emerald" }) => {
  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            {title}
          </span>
          <h3 className="text-3xl font-extrabold text-white tracking-tight">
            {prefix}
            <CountUp end={value || 0} duration={2} separator="," />
          </h3>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300 shadow-md shadow-emerald-500/10">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
