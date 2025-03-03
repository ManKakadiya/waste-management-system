
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthWrapper } from "./components/AuthWrapper";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Report from "./pages/Report";
import About from "./pages/About";
import Track from "./pages/Track";
import Auth from "./pages/Auth";
import RecyclingGuide from "./pages/RecyclingGuide";
import NotFound from "./pages/NotFound";
import MunicipalDashboard from "./pages/MunicipalDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthWrapper>
          <Navigation />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/report" element={<Report />} />
            <Route path="/about" element={<About />} />
            <Route path="/track" element={<Track />} />
            <Route path="/guide" element={<RecyclingGuide />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/municipal-dashboard" element={<MunicipalDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthWrapper>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
