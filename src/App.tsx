import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Buildings from "./pages/Buildings";
import CreateBuilding from "./pages/CreateBuilding";
import EditBuilding from "./pages/EditBuilding";
import BuildingView from "./pages/BuildingView";
import SectionView from "./pages/SectionView";
import Tasks from "./pages/Tasks";
import Index from "./pages/Index";
import { AppNavigation } from "./components/AppNavigation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <AppNavigation />
          <Routes>
            <Route path="/" element={<Navigate to="/buildings" replace />} />
            <Route path="/buildings" element={<Buildings />} />
            <Route path="/buildings/new" element={<CreateBuilding />} />
            <Route path="/buildings/:buildingId" element={<BuildingView />} />
            <Route path="/buildings/:buildingId/edit" element={<EditBuilding />} />
            <Route path="/buildings/:buildingId/sections/:sectionId" element={<SectionView />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/requests" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
