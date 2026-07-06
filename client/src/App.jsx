import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import NewInterview from './pages/NewInterview';
import InterviewSession from './pages/InterviewSession';
import SessionDetail from './pages/SessionDetail';
import ResumeAnalysis from './pages/ResumeAnalysis';
import AdminPanel from './pages/AdminPanel';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

// Redirect new users (no targetRole) to onboarding
const OnboardRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.targetRole) return <Navigate to="/onboarding" replace />;
  return children;
};

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      {/* Public */}
      <Route path="/"         element={<Landing />} />
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Onboarding — after register, before dashboard */}
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

      {/* Protected */}
      <Route path="/dashboard"       element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/interview/new"   element={<ProtectedRoute><NewInterview /></ProtectedRoute>} />
      <Route path="/interview/:id"   element={<ProtectedRoute><InterviewSession /></ProtectedRoute>} />
      <Route path="/session/:id"     element={<ProtectedRoute><SessionDetail /></ProtectedRoute>} />
      <Route path="/resume"          element={<ProtectedRoute><ResumeAnalysis /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
);

const App = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#f3f4f6',
              border: '1px solid #374151',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;