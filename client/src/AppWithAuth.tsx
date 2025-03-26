import { AuthProvider } from "./hooks/use-auth";
import App from "./App";

// This component wraps App with the AuthProvider
function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWithAuth;