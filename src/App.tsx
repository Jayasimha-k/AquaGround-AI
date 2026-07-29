// =============================================================================
// App.tsx — React Router v6 application routes
// =============================================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dashboard } from '@/pages/Dashboard';
import { MapPage } from '@/pages/MapPage';
import { Analytics } from '@/pages/Analytics';
import { Predictions } from '@/pages/Predictions';
import { RiskAssessment } from '@/pages/RiskAssessment';
import { DecisionSupport } from '@/pages/DecisionSupport';
import { Reports } from '@/pages/Reports';
import { Users } from '@/pages/Users';
import { Settings } from '@/pages/Settings';
import { ROUTES } from '@/constants';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
            <Route path={ROUTES.MAP} element={<MapPage />} />
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
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
