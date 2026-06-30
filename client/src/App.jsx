import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';

// Public Pages
import Home from './pages/public/Home';
import Services from './pages/public/Services';
import Portfolio from './pages/public/Portfolio';
import Blog from './pages/public/Blog';
import BlogDetail from './pages/public/BlogDetail';
import Contact from './pages/public/Contact';
import Login from './pages/public/Login';
import SignUp from './pages/public/SignUp';

// Shared Protected Pages
import Profile from './pages/shared/Profile';
import ChangePassword from './pages/shared/ChangePassword';

// Admin Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRequests from './pages/admin/AdminRequests';
import AdminProjects from './pages/admin/AdminProjects';
import AdminBlogs from './pages/admin/AdminBlogs';
import AdminPortfolio from './pages/admin/AdminPortfolio';
import AdminReviews from './pages/admin/AdminReviews';

// Route Guards
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-secondary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Workspace layout wrapper (holds sidebar & dashboard content area)
const DashboardLayout = ({ children }) => {
  const { user } = useAuth();
  const showSidebar = user && user.role === 'admin';

  return (
    <div className="flex flex-col min-h-screen bg-bgColor">
      <Navbar />
      <div className="flex flex-1">
        {showSidebar && <Sidebar />}
        <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full overflow-hidden">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

// Public layout wrapper
const PublicLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-bgColor">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
      <Route path="/portfolio" element={<PublicLayout><Portfolio /></PublicLayout>} />
      <Route path="/portfolio/:slug" element={<PublicLayout><Portfolio /></PublicLayout>} />
      <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
      <Route path="/blog/:slug" element={<PublicLayout><BlogDetail /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Shared Protected Routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout><Profile /></DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <DashboardLayout><ChangePassword /></DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Workspace Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <DashboardLayout><AdminDashboard /></DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/requests"
        element={
          <ProtectedRoute role="admin">
            <DashboardLayout><AdminRequests /></DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/projects"
        element={
          <ProtectedRoute role="admin">
            <DashboardLayout><AdminProjects /></DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/blogs"
        element={
          <ProtectedRoute role="admin">
            <DashboardLayout><AdminBlogs /></DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/portfolio"
        element={
          <ProtectedRoute role="admin">
            <DashboardLayout><AdminPortfolio /></DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reviews"
        element={
          <ProtectedRoute role="admin">
            <DashboardLayout><AdminReviews /></DashboardLayout>
          </ProtectedRoute>
        }
      />


      {/* Catch All Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <SocketProvider>
            <AppRoutes />
          </SocketProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}
