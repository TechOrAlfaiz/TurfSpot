import React from "react";
import { Sparkles, Trophy, Flame } from "lucide-react";

const MARQUEE_ITEMS = [
  {
    image: "/turfs/turf-1.jpg",
    title: "Box Cricket Under The Lights",
    tag: "🏏 Cricket",
    location: "Mansarovar, Jaipur",
    badge: "500 Lux LEDs"
  },
  {
    image: "/turfs/turf-2.jpg",
    title: "FIFA Monofilament Turf",
    tag: "⚽ Football",
    location: "Vaishali Nagar, Jaipur",
    badge: "Tournament Grade"
  },
  {
    image: "/turfs/turf-3.jpg",
    title: "Night Practice Nets",
    tag: "🏏 Cricket",
    location: "Malviya Nagar, Jaipur",
    badge: "Bowling Machine"
  },
  {
    image: "/turfs/turf-4.jpg",
    title: "7v7 Competitive Futsal",
    tag: "⚽ Football",
    location: "Jagatpura, Jaipur",
    badge: "Match Ready"
  },
  {
    image: "/turfs/turf-5.jpg",
    title: "Pink City Box League",
    tag: "🏏 Cricket",
    location: "Raja Park, Jaipur",
    badge: "High Safety Nets"
  },
  {
    image: "/turfs/turf-6.jpg",
    title: "Apex Executive Sports Club",
    tag: "⚡ Boutique Club",
    location: "C-Scheme, Jaipur",
    badge: "Hybrid Arena"
  },
  {
    image: "/turfs/turf-7.jpg",
    title: "Championship Derby Pitch",
    tag: "🏏⚽ Multi-Sport",
    location: "Pratap Nagar, Jaipur",
    badge: "Zero-Shadow"
  },
  {
    image: "/turfs/turf-8.jpg",
    title: "Late Night Floodlit Stadium",
    tag: "⚽ Football",
    location: "Tonk Road, Jaipur",
    badge: "Open 24/7"
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
              key={`marquee-item-${index}`}
              className="w-72 sm:w-80 h-52 sm:h-56 shrink-0 rounded-2xl overflow-hidden glass-panel border border-white/10 hover:border-emerald-500/40 relative group/card transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-emerald-500/15"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/banner-1.png";
                }}
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
