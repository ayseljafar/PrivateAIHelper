import { Route, Switch, useLocation } from "wouter";
import MainLayout from "./components/layout/main-layout";
import Dashboard from "./pages/dashboard";
import Chat from "./pages/chat";
import Projects from "./pages/projects";
import Deployments from "./pages/deployments";
import Integrations from "./pages/integrations";
import Logs from "./pages/logs";
import Approvals from "./pages/approvals";
import Settings from "./pages/settings";
import AuthPage from "./pages/auth-page";
import NotFound from "./pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import { useAuth } from "./hooks/use-auth";

// Simple app component - routes are protected by ProtectedRoute
function App() {
  const { user } = useAuth();

  // If the user is logged in and they try to access /auth, redirect to home
  if (user) {
    return (
      <MainLayout>
        <Switch>
          <Route path="/auth">
            <AuthRedirect />
          </Route>
          <ProtectedRoute path="/" component={Dashboard} />
          <ProtectedRoute path="/chat" component={Chat} />
          <ProtectedRoute path="/projects" component={Projects} />
          <ProtectedRoute path="/deployments" component={Deployments} />
          <ProtectedRoute path="/integrations" component={Integrations} />
          <ProtectedRoute path="/logs" component={Logs} />
          <ProtectedRoute path="/approvals" component={Approvals} />
          <ProtectedRoute path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </MainLayout>
    );
  }

  // Not logged in - show auth page or redirect to it
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route>
        <AuthRedirect />
      </Route>
    </Switch>
  );
}

// Simple redirect component to auth page
function AuthRedirect() {
  const [, navigate] = useLocation();
  navigate("/auth");
  return null;
}

export default App;
