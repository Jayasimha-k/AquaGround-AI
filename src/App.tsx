import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dashboard } from '@/pages/Dashboard';
import { MapPage } from '@/pages/MapPage';
import { WaterSources } from '@/pages/WaterSources';
import { Analytics } from '@/pages/Analytics';
import { Predictions } from '@/pages/Predictions';
import { RiskAssessment } from '@/pages/RiskAssessment';
import { DecisionSupport } from '@/pages/DecisionSupport';
import { Reports } from '@/pages/Reports';
import { Users } from '@/pages/Users';
import { Settings } from '@/pages/Settings';
import { Login } from '@/pages/Login';
import { ROUTES } from '@/constants';

function ProtectedApp() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.MAP} element={<MapPage />} />
        <Route path={ROUTES.WATER_SOURCES} element={<WaterSources />} />
        <Route path={ROUTES.ANALYTICS} element={<Analytics />} />
        <Route path={ROUTES.PREDICTIONS} element={<Predictions />} />
        <Route path={ROUTES.RISK} element={<RiskAssessment />} />
        <Route path={ROUTES.RECOMMENDATIONS} element={<DecisionSupport />} />
        <Route path={ROUTES.REPORTS} element={<Reports />} />
        <Route path={ROUTES.USERS} element={<Users />} />
        <Route path={ROUTES.SETTINGS} element={<Settings />} />
        {/* Catch-all → Dashboard */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <AppProvider>
            <ProtectedApp />
          </AppProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

