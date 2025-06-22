import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Chat from "./pages/Chat";
import OAuthCallback from "./components/OAuthCallback";
import ProtectedRoute from "./components/ProtectedRoute";
import DemoChat from "./pages/DemoChat";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/demo-chat"
          element={
              <DemoChat />
          }
        />
        <Route
          path="/chat"
          element={
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
          }
        />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
      </Routes>
    </Router>
  );
}

export default App;
