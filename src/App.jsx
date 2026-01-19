import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import BudgetPage from "./pages/BudgetPage";
import ExplorePage from "./pages/ExplorePage";
import PlannerPage from "./pages/PlannerPage";
import AIPage from "./pages/AIPage";
import TodoPage from "./pages/TodoPage";
import GamePage from "./pages/GamePage";
import EmergencyPage from "./pages/EmergencyPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";

function AppInner() {
  const location = useLocation();
  const hideNavbarPaths = [
    "/login",
    "/signup",
    "/dashboard",
    "/budget",
    "/planner",
    "/ai",
    "/game",
    "/emergency",
    "/todo",
    "/profile",
    "/profile/edit",
  ];
  const showNavbar = !hideNavbarPaths.includes(location.pathname);
  useEffect(() => {
    const cls = "no-navbar";
    if (!showNavbar) document.body.classList.add(cls);
    else document.body.classList.remove(cls);
    return () => document.body.classList.remove(cls);
  }, [showNavbar]);
  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/planner" element={<PlannerPage />} />
        <Route path="/todo" element={<TodoPage />} />
        <Route path="/ai" element={<AIPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/emergency" element={<EmergencyPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
