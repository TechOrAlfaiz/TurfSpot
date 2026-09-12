import { useState } from "react";
import { Search } from "lucide-react";

const SearchTurf = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full">
      <div className="relative flex-1">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by turf name, location, or sport type..."
          className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-900/60 text-white placeholder-slate-400 border border-white/10 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition-all"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            onSearch(e.target.value);
          }}
        />
      </div>
      <button
        type="submit"
        className="glow-btn px-6 py-3.5 rounded-xl text-sm font-bold text-white tracking-wide shrink-0"
      >
        Search
      </button>
    </form>
  );
};

export default SearchTurf;
