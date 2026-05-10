import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthGuard } from "@/components/auth-guard";
import { AppLayout } from "@/components/layout/app-layout";

import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import TripsList from "@/pages/trips/index";
import NewTrip from "@/pages/trips/new";
import TripShow from "@/pages/trips/show";
import EditTrip from "@/pages/trips/edit";
import TripBuild from "@/pages/trips/build";
import TripBudget from "@/pages/trips/budget";
import TripChecklist from "@/pages/trips/checklist";
import TripNotes from "@/pages/trips/notes";
import CitiesList from "@/pages/cities/index";
import ActivitiesList from "@/pages/activities/index";
import TripShare from "@/pages/share";
import Profile from "@/pages/profile";
import AdminDashboard from "@/pages/admin";

const queryClient = new QueryClient();

function AuthenticatedRoutes() {
  return (
    <AuthGuard>
      <AppLayout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/trips" component={TripsList} />
          <Route path="/trips/new" component={NewTrip} />
          <Route path="/trips/:id" component={TripShow} />
          <Route path="/trips/:id/edit" component={EditTrip} />
          <Route path="/trips/:id/build" component={TripBuild} />
          <Route path="/trips/:id/budget" component={TripBudget} />
          <Route path="/trips/:id/checklist" component={TripChecklist} />
          <Route path="/trips/:id/notes" component={TripNotes} />
          <Route path="/cities" component={CitiesList} />
          <Route path="/activities" component={ActivitiesList} />
          <Route path="/profile" component={Profile} />
          <Route path="/admin" component={AdminDashboard} />
          <Route component={NotFound} />
        </Switch>
      </AppLayout>
    </AuthGuard>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/share/:id" component={TripShare} />
      <Route path="/*" component={AuthenticatedRoutes} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
