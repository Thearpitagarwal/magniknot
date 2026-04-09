import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Package, Tags, Settings } from 'lucide-react';
import { logoutAdmin } from '../../services/api';

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      navigate('/admin/login', { replace: true });
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const navItems = [
    { name: 'Products', to: '/admin', icon: Package, end: true },
    { name: 'Categories', to: '/admin/categories', icon: Tags, end: false },
    { name: 'Settings', to: '/admin/settings', icon: Settings, end: false },
  ];

  return (
    <div className="min-h-screen bg-snow flex flex-col lg:flex-row font-body">
      
      {/* Mobile Top Bar */}
      <div className="lg:hidden bg-white border-b border-rose-100 p-4 flex justify-between items-center z-10 sticky top-0 shadow-sm">
        <div>
          <h1 className="font-display font-semibold text-xl text-charcoal">MagniKnot</h1>
          <p className="font-label text-[9px] tracking-[0.2em] text-warm-grey uppercase">Admin Panel</p>
        </div>
        <button onClick={handleLogout} className="text-warm-grey hover:text-rose-500 transition-colors">
          <LogOut size={20} />
        </button>
      </div>

      <div className="lg:hidden bg-white border-b border-rose-100 flex overflow-x-auto sticky top-[65px] z-10 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            end={item.end}
            className={({ isActive }) => 
              `flex items-center gap-2 px-4 py-3 font-label text-[11px] tracking-[0.1em] whitespace-nowrap transition-colors border-b-2 ${
                isActive ? 'border-rose-500 text-rose-500' : 'border-transparent text-warm-grey hover:text-charcoal'
              }`
            }
          >
            <item.icon size={15} />
            {item.name}
          </NavLink>
        ))}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-60 bg-white border-r border-rose-100 min-h-screen fixed left-0 top-0 py-8">
        <div className="px-7 mb-10">
          <h1 className="font-display font-semibold text-2xl text-charcoal mb-0.5">MagniKnot</h1>
          <p className="font-label text-[9px] tracking-[0.2em] text-warm-grey uppercase">Admin Panel</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.end}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-label text-[12px] tracking-[0.05em] ${
                  isActive 
                    ? 'bg-rose-50 text-rose-600 font-medium' 
                    : 'text-warm-grey hover:bg-snow hover:text-charcoal'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-4 mt-auto">
          <div className="w-full h-px bg-rose-100 mb-3" />
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-warm-grey hover:text-rose-500 rounded-xl hover:bg-rose-50 font-label text-[12px] tracking-[0.05em] transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-60 p-4 md:p-8 lg:p-10 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
