import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { BuildingsPage } from './pages/BuildingsPage';
import { SecretaryPage } from './pages/SecretaryPage';
import { Button } from './components/ui/button';
import { Home, ClipboardList } from 'lucide-react';
import universityLogo from './assets/logo.png';

function AppLayout() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-background">
      {/* Header con fondo degradado */}
      <div className="bg-gradient-to-r from-utfsm-blue/5 to-utfsm-navy/5 border-b">
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-shrink-0">
              <img 
                src={universityLogo} 
                alt="Universidad Técnica Federico Santa María" 
                className="h-16 w-auto"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-utfsm-blue">Sistema de Gestión de Salas</h1>
              <p className="text-muted-foreground">Universidad Técnica Federico Santa María - Departamento de Ingeniería</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={currentPath === '/' ? 'default' : 'outline'}
                asChild
                className="flex items-center gap-2"
              >
                <Link to="/">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Edificios</span>
                </Link>
              </Button>
              <Button
                variant={currentPath === '/secretary' ? 'default' : 'outline'}
                asChild
                className="flex items-center gap-2"
              >
                <Link to="/secretary">
                  <ClipboardList className="h-4 w-4" />
                  <span className="hidden sm:inline">Secretaría</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto p-4 md:p-6 pt-8">
        <Routes>
          <Route path="/" element={<BuildingsPage />} />
          <Route path="/secretary" element={<SecretaryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  );
}