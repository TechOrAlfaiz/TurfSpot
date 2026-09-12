import { Navigate, Outlet } from "react-router-dom";
import AuthNavbar from "../components/auth/AuthNavbar";
import { useSelector } from "react-redux";
import FuturisticNeuralBackground from "../components/common/FuturisticNeuralBackground";

export default function ProtectedLayout() {
  const { isLoggedIn } = useSelector((state) => state.auth);
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen relative text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      <FuturisticNeuralBackground />
      <AuthNavbar />
      <main className="flex-grow pt-20 relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
