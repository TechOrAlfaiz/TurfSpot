import React from "react";
import { Sparkles, Trophy, Flame } from "lucide-react";

const MARQUEE_ITEMS = [
  {
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
    title: "Box Cricket Under The Lights",
    tag: "🏏 Cricket",
    location: "Malviya Nagar, Jaipur",
    badge: "500 Lux LEDs"
  },
  {
    image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80",
    title: "FIFA Monofilament Turf",
    tag: "⚽ Football",
    location: "Mansarovar, Jaipur",
    badge: "Tournament Grade"
  },
  {
    image: "https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=800&q=80",
    title: "Night Practice Nets",
    tag: "🏏 Cricket",
    location: "Vaishali Nagar, Jaipur",
    badge: "Bowling Machine"
  },
  {
    image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80",
    title: "7v7 Competitive Futsal",
    tag: "⚽ Football",
    location: "C-Scheme, Jaipur",
    badge: "Match Ready"
  },
  {
    image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80",
    title: "Midnight Derby Matches",
    tag: "⚽ Football",
    location: "Tonk Road, Jaipur",
    badge: "Open 24/7"
  },
  {
    image: "https://images.unsplash.com/photo-1562077772-3ab1218688c0?auto=format&fit=crop&w=800&q=80",
    title: "Championship Box Turf",
    tag: "🏏 Cricket",
    location: "Jagatpura, Jaipur",
    badge: "High Safety Nets"
  },
  {
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80",
    title: "Late Night Floodlit Pitch",
    tag: "⚽ Football",
    location: "Durgapura, Jaipur",
    badge: "Zero-Shadow"
  },
  {
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
    title: "Weekend Cricket Knockouts",
    tag: "🏏 Cricket",
    location: "Raja Park, Jaipur",
    badge: "Dual Pitch"
  }
];

const SportsImageMarquee = () => {
  // Duplicate array for seamless infinite marquee loop
  const displayItems = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <section className="py-16 relative z-10 overflow-hidden">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3 shadow-lg shadow-emerald-500/10">
          <Flame className="w-4 h-4 fill-emerald-400" />
          <span>Pink City Sports Culture</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Where Jaipur Comes <span className="text-gradient-emerald">To Play</span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mt-2">
          From sunset cricket derbies to midnight football showdowns under 500-lux stadium floodlights.
        </p>
      </div>

      {/* Marquee Container with Subtle Edge Fades */}
      <div className="relative w-full overflow-hidden select-none group">
        {/* Left and Right Fade Gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#060c18] to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#060c18] to-transparent z-20 pointer-events-none" />

        {/* Continuous Scrolling Track */}
        <div className="animate-marquee-infinite flex gap-5 py-2">
          {displayItems.map((item, index) => (
            <div
              key={index}
              className="w-72 sm:w-80 h-52 sm:h-56 shrink-0 rounded-2xl overflow-hidden glass-panel border border-white/10 hover:border-emerald-500/40 relative group/card transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-emerald-500/15"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Badges on Top */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-[11px] font-bold text-emerald-300">
                  {item.tag}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-[10px] font-semibold text-slate-300">
                  {item.badge}
                </span>
              </div>

              {/* Info on Bottom */}
              <div className="absolute bottom-3 left-3 right-3">
                <h4 className="text-sm sm:text-base font-bold text-white group-hover/card:text-emerald-300 transition-colors drop-shadow">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-300/80 font-medium">
                  {item.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SportsImageMarquee;
