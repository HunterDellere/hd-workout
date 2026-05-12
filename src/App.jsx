import { HashRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Day } from './pages/Day';
import { Section } from './pages/Section';
import { ExercisePage } from './pages/Exercise';
import { BottomNav } from './components/BottomNav';
import { PWAInstallBanner } from './components/PWAInstallBanner';

// HashRouter avoids GitHub Pages 404s on deep links.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:dayKey" element={<Day />} />
        <Route path="/:dayKey/section/:sectionKey" element={<Section />} />
        <Route path="/:dayKey/exercise/:exerciseId" element={<ExercisePage />} />
      </Routes>
      <PWAInstallBanner />
      <BottomNav />
    </HashRouter>
  );
}
