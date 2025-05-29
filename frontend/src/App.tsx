import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import OTPVerification from "./pages/OTPVerification";
import ResetPassword from "./pages/ResetPassword";
import Challenges from "./pages/Challenges";
import CreateGuess from "./pages/CreateGuess";
import GuessChallenge from "./pages/GuessChallenge";
import Gallery from "./pages/Gallery";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import MyPhotos from "./pages/MyPhotos";
import NotFound from "./pages/NotFound";
import HowToPlay from "./pages/HowToPlay";
import Admin from '@/pages/Admin';
import CreateChallenge from '@/pages/CreateChallenge';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/otp-verification" element={<OTPVerification />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/challenges/create" element={<CreateGuess />} />
          <Route path="/challenges/guess/:id" element={<GuessChallenge />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-photos" element={<MyPhotos />} />
          <Route path="/how-to-play" element={<HowToPlay />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/challenges/new" element={<CreateChallenge />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
