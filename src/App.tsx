import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Buildings from "./pages/Buildings";
import CreateBuilding from "./pages/CreateBuilding";
import BuildingView from "./pages/BuildingView";
import SectionView from "./pages/SectionView";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/buildings" replace />} />
          <Route path="/buildings" element={<Buildings />} />
          <Route path="/buildings/new" element={<CreateBuilding />} />
          <Route path="/buildings/:buildingId" element={<BuildingView />} />
          <Route path="/buildings/:buildingId/sections/:sectionId" element={<SectionView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
