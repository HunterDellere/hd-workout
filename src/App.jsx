import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Surface, Masthead } from './design-system/components';
import { BottomNav } from './components/BottomNav';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { UpdateBanner } from './components/UpdateBanner';
import { SessionBar } from './components/SessionBar';
import { Onboarding } from './components/Onboarding';

// Legacy day-rooted exercise URLs redirect to the canonical pattern-first route.
function LegacyExerciseRedirect() {
  const { exerciseId } = useParams();
  return <Navigate replace to={`/library/exercises/${exerciseId}`} />;
}

// Route-level code splitting: every page is lazy. Today is the cold-open
// (root URL); Home is gone — Today owns "what am I doing today, let's start"
// and the rest-day branch handles the quiet alternative.
const Today = lazy(() => import('./pages/Today').then((m) => ({ default: m.Today })));
const Day = lazy(() => import('./pages/Day').then((m) => ({ default: m.Day })));
const ExercisePage = lazy(() => import('./pages/Exercise').then((m) => ({ default: m.ExercisePage })));
const Library = lazy(() => import('./pages/Library').then((m) => ({ default: m.Library })));
const LibraryPattern = lazy(() =>
  import('./pages/LibraryPattern').then((m) => ({ default: m.LibraryPattern })),
);
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })));
const Me = lazy(() => import('./pages/Me').then((m) => ({ default: m.Me })));
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));
const Insights = lazy(() => import('./pages/Insights').then((m) => ({ default: m.Insights })));
const Glossary = lazy(() => import('./pages/Glossary').then((m) => ({ default: m.Glossary })));
const History = lazy(() => import('./pages/History').then((m) => ({ default: m.History })));

function RouteFallback() {
  return <Surface as="main" level="page" style={{ minHeight: '100vh' }} />;
}

// HashRouter avoids GitHub Pages 404s on deep links.
// Order matters: literal-prefix routes (/me, /library, /log) must be
// declared before the catch-all `/:dayKey` or React Router will match
// the catch-all first and never reach them.
export default function App() {
  return (
    <HashRouter>
      <Masthead />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Today owns the cold-open. */}
          <Route path="/" element={<Today />} />

          {/* Log: history of work + insights. */}
          <Route path="/log" element={<History />} />
          <Route path="/log/insights" element={<Insights />} />

          {/* You. */}
          <Route path="/me" element={<Me />} />
          <Route path="/me/settings" element={<Settings />} />
          <Route path="/me/about" element={<About />} />
          <Route path="/me/glossary" element={<Glossary />} />

          {/* Library. */}
          <Route path="/library" element={<Library />} />
          <Route path="/library/movements/:movementKey" element={<LibraryPattern />} />
          <Route path="/library/exercises/:exerciseId" element={<ExercisePage />} />

          {/* Legacy redirects (one release of grace). */}
          <Route path="/today" element={<Navigate replace to="/" />} />
          <Route path="/history" element={<Navigate replace to="/log" />} />
          <Route path="/insights" element={<Navigate replace to="/log/insights" />} />

          {/* Day-rooted catch-all (push / pull / legs / core / recovery). */}
          <Route path="/:dayKey" element={<Day />} />
          <Route path="/:dayKey/exercise/:exerciseId" element={<LegacyExerciseRedirect />} />
        </Routes>
      </Suspense>
      <PWAInstallBanner />
      <UpdateBanner />
      <SessionBar />
      <BottomNav />
      <Onboarding />
    </HashRouter>
  );
}
