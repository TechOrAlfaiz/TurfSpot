import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import FuturisticNeuralBackground from "../components/common/FuturisticNeuralBackground";

const Root = () => {
  return (
    <div className="flex flex-col min-h-screen relative text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      <FuturisticNeuralBackground />
      <Navbar />
      <main className="flex-grow pt-20 relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default Root;
