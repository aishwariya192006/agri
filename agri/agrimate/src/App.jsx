import { lazy, Suspense } from 'react';
import { LangProvider } from './i18n/LangContext';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';

const Landing = lazy(() => import('./pages/Landing'));
const Auth = lazy(() => import('./pages/Auth'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Blog = lazy(() => import('./pages/Blog'));
const Shop = lazy(() => import('./pages/Shop'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AICopilot = lazy(() => import('./pages/AICopilot'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const SeedRecommendation = lazy(() => import('./pages/SeedRecommendation'));
const SoilAnalysis = lazy(() => import('./pages/SoilAnalysis'));
const DiseaseDetection = lazy(() => import('./pages/DiseaseDetection'));
const PestForecasting = lazy(() => import('./pages/PestForecasting'));
const WeatherIrrigation = lazy(() => import('./pages/WeatherIrrigation'));
const MarketIntelligence = lazy(() => import('./pages/MarketIntelligence'));
const ProfitPrediction = lazy(() => import('./pages/ProfitPrediction'));
const GovtSchemes = lazy(() => import('./pages/GovtSchemes'));
const FarmCalendar = lazy(() => import('./pages/FarmCalendar'));
const Community = lazy(() => import('./pages/Community'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Profile = lazy(() => import('./pages/Profile'));

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        border: '3px solid rgba(196,163,90,0.2)',
        borderTop: '3px solid #C4A35A',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
    <AuthProvider>
    <BrowserRouter>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/app" element={<Layout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="copilot" element={<AICopilot />} />
            <Route path="assistant" element={<AIAssistant />} />
            <Route path="seeds" element={<SeedRecommendation />} />
            <Route path="soil" element={<SoilAnalysis />} />
            <Route path="disease" element={<DiseaseDetection />} />
            <Route path="pests" element={<PestForecasting />} />
            <Route path="weather" element={<WeatherIrrigation />} />
            <Route path="market" element={<MarketIntelligence />} />
            <Route path="profit" element={<ProfitPrediction />} />
            <Route path="schemes" element={<GovtSchemes />} />
            <Route path="calendar" element={<FarmCalendar />} />
            <Route path="community" element={<Community />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
    </AuthProvider>
    </LangProvider>
  );
}
