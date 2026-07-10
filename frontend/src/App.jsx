import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import AuthPage from './components/AuthPage';
import MainApp from './components/MainApp';
import ToastContainer from './components/Toast';
import './index.css';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-page">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  return user ? (
    <>
      <MainApp />
      <ToastContainer />
    </>
  ) : (
    <AuthPage />
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
