import { lazy, Suspense } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import LandingPage from './App';

const ProductApp = lazy(() => import('./ProductApp'));

function ProductLoading() {
  return (
    <main className="route-loading" aria-live="polite">
      <span className="section-kicker section-kicker--dark">STACKSENSE</span>
      <h1>OPENING YOUR WORKSPACE</h1>
      <p>Loading the product demo…</p>
    </main>
  );
}

export function NotFound() {
  return (
    <main className="not-found grid-bg">
      <span className="section-kicker section-kicker--dark">404 · NOT FOUND</span>
      <h1>THIS SOURCE<br />DOESN'T EXIST.</h1>
      <p>The page may have moved, but your next step is still clear.</p>
      <div>
        <Link className="button button--dark" to="/">Back to landing page</Link>
        <Link className="button button--yellow" to="/app">Open product demo</Link>
      </div>
    </main>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app/*" element={<Suspense fallback={<ProductLoading />}><ProductApp /></Suspense>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
