import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Package, Settings, LifeBuoy, Wrench, LogOut, Shield, Globe, Zap, Menu, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import useMediaQuery from '@/hooks/useMediaQuery';

const SuperAdminLayout = () => {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem('superAdminAuthenticated');
    navigate('/super-admin-login');
  };

  const navItems = [
    { to: '/super-admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/super-admin/users-and-plans', icon: Users, label: 'Usuários e Planos' },
    { to: '/super-admin/plans', icon: Package, label: 'Planos' },
    { to: '/super-admin/modules', icon: Grid3X3, label: 'Gerenciar Módulos' },
    { to: '/super-admin/global-settings', icon: Globe, label: 'Configurações Globais' },
    { to: '/super-admin/integrations', icon: Zap, label: 'Integrações' },
    { to: '/super-admin/support', icon: LifeBuoy, label: 'Suporte' },
    { to: '/super-admin/tools', icon: Wrench, label: 'Ferramentas' },
  ];

  const NavContent = ({ isSheet = false }) => (
    <div className="flex flex-col h-full">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-700/50">
        <Shield className="h-8 w-8 text-emerald-400" />
        <div>
          <h1 className="text-xl font-bold text-gradient">Super Admin</h1>
          <p className="text-xs text-gray-400">Painel de Controle</p>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const NavComponent = isSheet ? SheetClose : 'div';
          return (
            <NavComponent key={item.to} asChild>
              <NavLink
                to={item.to}
                onClick={() => setIsSheetOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out
                  ${isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500'
                    : 'text-gray-300 hover:bg-slate-800/60 hover:text-white'
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </NavLink>
            </NavComponent>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-700/50">
        <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-red-500/10 hover:text-red-400" onClick={handleLogout}>
          <LogOut className="mr-3 h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-900 text-white bg-grid-pattern">
      {isDesktop ? (
        <aside className="w-64 bg-slate-900/80 backdrop-blur-lg border-r border-slate-700/50 flex-shrink-0">
          <NavContent />
        </aside>
      ) : (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <header className="absolute top-0 left-0 p-4 z-50">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </header>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 glass-effect border-r-slate-700/50">
            <NavContent isSheet={true} />
          </SheetContent>
        </Sheet>
      )}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto pt-20 lg:pt-8">
        <Outlet />
      </main>
    </div>
  );
};

export default SuperAdminLayout;