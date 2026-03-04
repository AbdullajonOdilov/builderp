import { ThemeProvider } from "next-themes";
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
import Finance from "./pages/Finance";
import IshlarDoskasi from "./pages/IshlarDoskasi";
import Index from "./pages/Index";
import FeatureFlags from "./pages/FeatureFlags";
import { AppNavigation } from "./components/AppNavigation";
import { OfflineBanner } from "./components/OfflineBanner";
import { FeatureFlagProvider } from "./contexts/FeatureFlagContext";
import { FeatureRoute } from "./components/FeatureRoute";
import { NotificationProvider } from "./contexts/NotificationContext";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <FeatureFlagProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <OfflineBanner />
            <BrowserRouter>
              <div className="min-h-screen bg-background">
                <AppNavigation />
                <Routes>
                  <Route path="/" element={<Navigate to="/buildings" replace />} />
                  <Route path="/buildings" element={<FeatureRoute flagKey="page_buildings"><Buildings /></FeatureRoute>} />
                  <Route path="/buildings/new" element={<FeatureRoute flagKey="page_buildings"><CreateBuilding /></FeatureRoute>} />
                  <Route path="/buildings/:buildingId" element={<FeatureRoute flagKey="page_buildings"><BuildingView /></FeatureRoute>} />
                  <Route path="/buildings/:buildingId/edit" element={<FeatureRoute flagKey="page_buildings"><EditBuilding /></FeatureRoute>} />
                  <Route path="/buildings/:buildingId/sections/:sectionId" element={<FeatureRoute flagKey="page_buildings"><SectionView /></FeatureRoute>} />
                  <Route path="/tasks" element={<FeatureRoute flagKey="page_tasks"><Tasks /></FeatureRoute>} />
                  <Route path="/finance" element={<FeatureRoute flagKey="page_finance"><Finance /></FeatureRoute>} />
                  <Route path="/ishlar-doskasi" element={<FeatureRoute flagKey="page_ishlar_doskasi"><IshlarDoskasi /></FeatureRoute>} />
                  <Route path="/requests" element={<FeatureRoute flagKey="page_requests"><Index /></FeatureRoute>} />
                  <Route path="/feature-flags" element={<FeatureFlags />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </FeatureFlagProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
