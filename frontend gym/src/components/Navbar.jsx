import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Dumbbell, LogOut, ChevronDown, 
  LayoutDashboard, Users, Wallet, BarChart3, Settings,
  CalendarDays, UserPlus, CreditCard, ClipboardList,
  Shield, Activity, UserCog
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (location.pathname === '/') return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Estructura anidada de navegación
  const navigation = [
    {
      label: 'Recepción',
      icon: LayoutDashboard,
      subItems: [
        { path: '/dashboard', label: 'Dashboard Principal', icon: LayoutDashboard },
        // { path: '/asistencia', label: 'Registrar Asistencia', icon: CalendarDays },
      ]
    },
    {
      label: 'Clientes',
      icon: Users,
      subItems: [
        { path: '/clientes', label: 'Directorio', icon: Users },
        { path: '/membresias', label: 'Planes de Membresía', icon: Dumbbell },
      ]
    },
    {
      label: 'Caja',
      icon: Wallet,
      subItems: [
        { path: '/inscripciones', label: 'Inscripciones y Cobro', icon: UserPlus },
        { path: '/metodos-pago', label: 'Tipos de Pago', icon: CreditCard },
      ]
    },
    {
      label: 'Reportes',
      icon: BarChart3,
      subItems: [
        { path: '/reportes/finanzas', label: 'Reporte de Cobranza', icon: Wallet },
        { path: '/reportes/asistencia', label: 'Reporte de Asistencia', icon: Activity },
        { path: '/reportes/clientes', label: 'Reporte de Estado', icon: Users },
      ]
    },
    {
      label: 'Administración',
      icon: Settings,
      subItems: [
        { path: '/usuarios', label: 'Personal', icon: UserCog },
        { path: '/roles', label: 'Roles y Permisos', icon: Shield },
        { path: '/bitacora', label: 'Bitácora', icon: Activity },
      ]
    }
  ];

  return (
    <nav className="bg-[#181818] border-b-4 border-blue-600 sticky top-0 z-50 shadow-lg">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group shrink-0 mr-8">
            <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-500 transition-colors">
              <Dumbbell size={24} className="text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-widest uppercase">
              Power<span className="text-blue-500">Fit</span>
            </span>
          </Link>

          {/* Menú Principal (Dropdowns) */}
          <div className="hidden md:flex items-center space-x-1 flex-1">
            {navigation.map((category, index) => {
              const CategoryIcon = category.icon;
              // Verificar si estamos en alguna ruta hija de esta categoría
              const isActiveCategory = category.subItems.some(sub => location.pathname.startsWith(sub.path));

              return (
                <div key={index} className="relative group">
                  <button 
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-bold uppercase tracking-wide text-sm transition-all duration-200
                      ${isActiveCategory 
                        ? 'text-blue-500 bg-[#2a2a2a]' 
                        : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                      }`}
                  >
                    <CategoryIcon size={18} />
                    <span>{category.label}</span>
                    <ChevronDown size={14} className="opacity-50 group-hover:rotate-180 transition-transform duration-300" />
                  </button>

                  {/* Menú Desplegable */}
                  {category.subItems.length > 0 && (
                    <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[240px]">
                      <div className="bg-[#1e1e1e] border-t-4 border-blue-600 rounded-b-lg shadow-2xl py-2 overflow-hidden border border-[#333]">
                        {category.subItems.map((subItem, subIndex) => {
                          const SubIcon = subItem.icon;
                          const isActive = location.pathname === subItem.path;
                          
                          return (
                            <Link
                              key={subIndex}
                              to={subItem.path}
                              className={`flex items-center gap-3 px-5 py-3 text-sm font-bold uppercase tracking-wide transition-colors
                                ${isActive 
                                  ? 'bg-blue-600/10 text-blue-500 border-l-4 border-blue-500' 
                                  : 'text-gray-400 hover:bg-[#2a2a2a] hover:text-white border-l-4 border-transparent'
                                }`}
                            >
                              <SubIcon size={16} />
                              {subItem.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Usuario y Logout */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-white uppercase tracking-wider">{user?.name || 'Administrador'}</span>
              <span className="text-xs font-semibold text-blue-400 uppercase">{user?.role || 'Admin'}</span>
            </div>
            <div className="h-10 w-px bg-gray-800 mx-2"></div>
            <button 
              onClick={handleLogout}
              title="Cerrar Sesión"
              className="p-2.5 rounded-lg bg-[#2a2a2a] text-gray-400 hover:text-red-500 hover:bg-red-500/10 border border-[#333] hover:border-red-500/30 transition-all"
            >
              <LogOut size={20} />
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
