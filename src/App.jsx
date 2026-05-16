import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Home } from './pages/Home';
import { Surface } from './design-system/components';
import { BottomNav } from './components/BottomNav';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { SessionBar } from './components/SessionBar';
import { UpdateBanner } from './components/UpdateBanner';

// Legacy day-rooted exercise URLs redirect to the canonical pattern-first route.
function LegacyExerciseRedirect() {
  const { exerciseId } = useParams();
  return <Navigate replace to={`/library/exercises/${exerciseId}`} />;
}

// Route-level code splitting: every page EXCEPT Home is lazy.
const Day = lazy(() => import('./pages/Day').then((m) => ({ default: m.Day })));
const Section = lazy(() => import('./pages/Section').then((m) => ({ default: m.Section })));
const ExercisePage = lazy(() => import('./pages/Exercise').then((m) => ({ default: m.ExercisePage })));
const Library = lazy(() => import('./pages/Library').then((m) => ({ default: m.Library })));
const LibraryPattern = lazy(() =>
  import('./pages/LibraryPattern').then((m) => ({ default: m.LibraryPattern })),
);
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })));
const Me = lazy(() => import('./pages/Me').then((m) => ({ default: m.Me })));
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));
const Today = lazy(() => import('./pages/Today').then((m) => ({ default: m.Today })));
const Insights = lazy(() => import('./pages/Insights').then((m) => ({ default: m.Insights })));
const Glossary = lazy(() => import('./pages/Glossary').then((m) => ({ default: m.Glossary })));
const History = lazy(() => import('./pages/History').then((m) => ({ default: m.History })));

function RouteFallback() {
  return <Surface as="main" level="page" style={{ minHeight: '100vh' }} />;
}

// HashRouter avoids GitHub Pages 404s on deep links.
// Order matters: literal-prefix routes (/today, /me, /library) must be
// declared before the catch-all `/:dayKey` or React Router will match the
// catch-all first and never reach them.
export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/today" element={<Today />} />
          <Route path="/me" element={<Me />} />
          <Route path="/me/settings" element={<Settings />} />
          <Route path="/me/about" element={<About />} />
          <Route path="/me/glossary" element={<Glossary />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/history" element={<History />} />
          <Route path="/library" element={<Library />} />
          <Route path="/library/movements/:movementKey" element={<LibraryPattern />} />
          <Route path="/library/exercises/:exerciseId" element={<ExercisePage />} />
          <Route path="/:dayKey" element={<Day />} />
          <Route path="/:dayKey/section/:sectionKey" element={<Section />} />
          <Route path="/:dayKey/exercise/:exerciseId" element={<LegacyExerciseRedirect />} />
        </Routes>
      </Suspense>
      <PWAInstallBanner />
      <UpdateBanner />
      <SessionBar />
      <BottomNav />
    </HashRouter>
  );
}
