
import { AuthProvider } from '../contexts/AuthContext';
import { DataProvider } from '../contexts/DataContext';
import LoginScreen from '../components/auth/LoginScreen';
import Dashboard from '../components/dashboard/Dashboard';
import { useAuth } from '../contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';

const AppContent = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {!isAuthenticated ? (
        <LoginScreen onLogin={() => {}} />
      ) : (
        <Dashboard userRole={user?.role || null} />
      )}
      <Toaster />
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
};

export default Index;
