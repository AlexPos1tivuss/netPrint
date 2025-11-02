import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Pages
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import CatalogPage from "@/pages/catalog-page";
import ProductConfigPage from "@/pages/product-config-page";
import UploadPhotosPage from "@/pages/upload-photos-page";
import PhotographerSelectionPage from "@/pages/photographer-selection-page";
import ProfilePage from "@/pages/profile-page";
import AdminDashboardPage from "@/pages/admin-dashboard-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected routes */}
      <ProtectedRoute path="/catalog" component={CatalogPage} />
      <ProtectedRoute path="/product/:type" component={ProductConfigPage} />
      <ProtectedRoute path="/upload" component={UploadPhotosPage} />
      <ProtectedRoute path="/photographer" component={PhotographerSelectionPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/admin" component={AdminDashboardPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;