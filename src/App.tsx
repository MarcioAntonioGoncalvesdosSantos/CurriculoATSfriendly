import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Analysis } from './pages/Analysis';
import { Landing } from './pages/Landing';
import { NotFound } from './pages/NotFound';
import { PrintCv } from './pages/PrintCv';
import { Wizard } from './pages/Wizard';

export function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<Navigate to="/app/nova" replace />} />
          <Route path="/app/nova" element={<Wizard />} />
          <Route path="/app/analise/:id" element={<Analysis />} />
          <Route path="/print/:id" element={<PrintCv />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
