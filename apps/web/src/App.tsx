import { lazy, Suspense } from 'react'
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'

const HomePage = lazy(() => import('./pages/HomePage'))
const TouchPage = lazy(() => import('./pages/TouchPage'))
const FieldGuidePage = lazy(() => import('./pages/FieldGuidePage'))
const HerbariumPage = lazy(() => import('./pages/HerbariumPage'))
const SharePage = lazy(() => import('./pages/SharePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function Boot() {
  return (
    <div className="boot" role="status" aria-live="polite">
      <span className="boot__mark">HORTUS MANUS</span>
      <span className="boot__line">正在引光 · bringing the light in</span>
    </div>
  )
}

const Router = import.meta.env.VITE_STATIC_MODE === 'true' ? HashRouter : BrowserRouter

export default function App() {
  return (
    <Router>
      <Suspense fallback={<Boot />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/touch" element={<TouchPage />} />
          <Route path="/field-guide" element={<FieldGuidePage />} />
          <Route path="/herbarium" element={<HerbariumPage />} />
          <Route path="/s/:id" element={<SharePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--paper, #F6F1E7)',
            color: 'var(--ink, #1C211A)',
            border: '1px solid var(--line, rgba(28,33,26,.18))',
            borderRadius: '2px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '12px',
          },
        }}
      />
    </Router>
  )
}