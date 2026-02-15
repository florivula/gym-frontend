import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import Weight from "./pages/Weight";
import Food from "./pages/Food";
import GymSession from "./pages/GymSession";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="dark min-h-screen bg-background text-foreground">
          <Navigation />
          <main className="mx-auto max-w-4xl px-4 py-6 pb-24 md:pb-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/weight" element={<Weight />} />
              <Route path="/food" element={<Food />} />
              <Route path="/gym" element={<GymSession />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
