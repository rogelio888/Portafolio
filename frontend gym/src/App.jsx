import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Bitacora from './pages/Bitacora';
import Clientes from './pages/Clientes';
import Membresias from './pages/Membresias';
import Inscripciones from './pages/Inscripciones';
import Dashboard from './pages/Dashboard';
import MetodosPago from './pages/MetodosPago';
import Reportes from './pages/Reportes';

// Placeholder components for pages

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/usuarios" element={<Users />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/bitacora" element={<Bitacora />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/membresias" element={<Membresias />} />
          <Route path="/inscripciones" element={<Inscripciones />} />
          <Route path="/metodos-pago" element={<MetodosPago />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/reportes/:tab" element={<Reportes />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
