import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider, useApp } from "./contexts/AppContext";
// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import RegisterSelection from "./pages/RegisterSelection";
import RegisterTrainee from "./pages/RegisterTrainee";
import RegisterCreator from "./pages/RegisterCreator";
import DashboardTrainee from "./pages/DashboardTrainee";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardCreator from "./pages/DashboardCreator";
import Courses from "./pages/Courses";
import Study from "./pages/Study";
import Interview from "./pages/Interview";
import Loading from "./pages/Loading";
import Report from "./pages/Report";
import Attempts from "./pages/Attempts";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
// Protected Route Wrapper
function ProtectedRoute({ component: Component }) {
  const { user } = useApp();
  const [, navigate] = useLocation();
  if (!user) {
    navigate("/login");
    return null;
  }
  return <Component />;
}
function Router() {
  return (<Switch>
    <Route path="/" component={Landing} />
    <Route path="/login" component={Login} />
    <Route path="/register" component={RegisterSelection} />
    <Route path="/register/trainee" component={RegisterTrainee} />
    <Route path="/register/creator" component={RegisterCreator} />

    {/* Protected Routes */}
    <Route path="/dashboard/trainee" component={() => <ProtectedRoute component={DashboardTrainee} />} />
    <Route path="/dashboard/admin" component={() => <ProtectedRoute component={DashboardAdmin} />} />
    <Route path="/admin/users" component={() => <ProtectedRoute component={DashboardAdmin} />} />
    <Route path="/admin/content" component={() => <ProtectedRoute component={DashboardAdmin} />} />
    <Route path="/admin/analytics" component={() => <ProtectedRoute component={Analytics} />} />
    <Route path="/dashboard/creator" component={() => <ProtectedRoute component={DashboardCreator} />} />
    <Route path="/creator/courses" component={() => <ProtectedRoute component={DashboardCreator} />} />
    <Route path="/creator/analytics" component={() => <ProtectedRoute component={Analytics} />} />
    <Route path="/courses" component={() => <ProtectedRoute component={Courses} />} />
    <Route path="/study/:courseId" component={() => <ProtectedRoute component={Study} />} />
    <Route path="/interview/:courseId" component={() => <ProtectedRoute component={Interview} />} />
    <Route path="/loading" component={() => <ProtectedRoute component={Loading} />} />
    <Route path="/attempts" component={() => <ProtectedRoute component={Attempts} />} />
    <Route path="/report/:attemptId" component={() => <ProtectedRoute component={Report} />} />

    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>);
}
function App() {
  return (<ErrorBoundary>
    <AppProvider>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </AppProvider>
  </ErrorBoundary>);
}
export default App;
