import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layout/MainLayout';
import AuthLayout from './layout/AuthLayout';

import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import DataAnalysis from './pages/DataAnalysis';
import Training from './pages/Training';
import TrainingBooking from './pages/TrainingBooking';
import Contact from './pages/Contact';
import Booking from './pages/Booking';
import AuthPage from './pages/auth/AuthPage';
import RegisterPage from './pages/auth/RegisterPage';
import RegisterVerifyPage from './pages/auth/RegisterVerifyPage';
import Profile from './pages/Profile';
import OrganizationStructure from './pages/OrganizationStructure';
import AdminDashboard from './pages/admin/AdminDashboard';
import ClientDetails from './pages/admin/ClientDetails';
import AdminProfile from './pages/admin/AdminProfile';
import PasswordResetOtpFlow from './pages/auth/PasswordResetOtpFlow';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
 const { isLoggedIn, user } = useAuth();
 if (!isLoggedIn) {
 return <Navigate to="/auth" replace />;
 }
 if (requireAdmin && user?.role !== 'admin') {
 return <Navigate to="/" replace />;
 }
 return <>{children}</>;
};

function AppRoutes() {
 const { isLoggedIn, user } = useAuth();

 return (
 <Routes>
      {/* Legacy auth paths -> unified AuthPage */}
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      <Route path="/register" element={<Navigate to="/auth/register" replace />} />
      <Route path="/forgot-password" element={<Navigate to="/auth" replace />} />
      <Route path="/reset-password" element={<Navigate to="/auth" replace />} />
      <Route
        path="/auth/reset-with-otp"
        element={
          <AuthLayout>
            <PasswordResetOtpFlow />
          </AuthLayout>
        }
      />

      <Route
        path="/auth/register/verify"
        element={
          isLoggedIn ? (
            <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/'} replace />
          ) : (
            <AuthLayout>
              <RegisterVerifyPage />
            </AuthLayout>
          )
        }
      />
      <Route
        path="/auth/register"
        element={
          isLoggedIn ? (
            <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/'} replace />
          ) : (
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          )
        }
      />

      <Route
        path="/auth"
        element={
          isLoggedIn ? (
            <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/'} replace />
          ) : (
            <AuthLayout>
              <AuthPage />
            </AuthLayout>
          )
        }
      />
 
 <Route
 path="/admin/*"
 element={
 <ProtectedRoute requireAdmin>
 <MainLayout>
 <Routes>
 <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users/:id" element={<ClientDetails />} />
            <Route path="profile" element={<AdminProfile />} />
 <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
 </Routes>
 </MainLayout>
 </ProtectedRoute>
 }
 />

 <Route
 path="/*"
 element={
 <ProtectedRoute>
 <MainLayout>
 <Routes>
 <Route path="/" element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <Home />} />
 <Route path="/about" element={<About />} />
 <Route path="/services" element={<Services />} />
 <Route path="/data-analysis" element={<DataAnalysis />} />
 <Route path="/training" element={<Training />} />
 <Route path="/training-booking" element={<TrainingBooking />} />
 <Route path="/contact" element={<Contact />} />
<Route path="/organization-structure" element={<OrganizationStructure />} />
 <Route path="/booking" element={<Booking />} />
 <Route path="/profile" element={<Profile />} />
 <Route path="*" element={<Navigate to="/" replace />} />
 </Routes>
 </MainLayout>
 </ProtectedRoute>
 }
 />
 </Routes>
 );
}

function App() {
 return (
 <AuthProvider>
 <LanguageProvider>
<Toaster
  position="top-right"
  toastOptions={{
    duration: 4000,
    style: {
      background: '#1f2937',
      color: '#fff',
      borderRadius: '12px',
      padding: '12px 16px',
      fontSize: '14px',
    },
  }}
/>
 <Router>
 <AppRoutes />
 </Router>
 </LanguageProvider>
 </AuthProvider>
 );
}

export default App;
