import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Receipt, Users, BarChart3, FileText, Settings, Menu, X, TrendingUp, Sparkles, LogOut, ShieldCheck, Send, AreaChart, Target, Truck, CalendarClock, CreditCard, Shield, Landmark, ArrowLeftRight, Home, Plus, Package } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import useMediaQuery from '@/hooks/useMediaQuery';
const menuItemsConfig = [{
  id: 'dashboard_ativo',
  icon: LayoutDashboard,
  label: 'Dashboard',
  path: '/dashboard'
}, {
  id: 'lancamentos_ativo',
  icon: Receipt,
  label: 'Lançamentos',
  path: '/lancamentos'
}, {
  id: 'contas_bancarias_ativo',
  icon: Landmark,
  label: 'Contas Bancárias',
  path: '/contas-bancarias'
}, {
  id: 'conciliacao_bancaria_ativo',
  icon: ArrowLeftRight,
  label: 'Conciliação',
  path: '/conciliacao-bancaria'
}, {
  id: 'crediario_ativo',
  icon: CreditCard,
  label: 'Contas a Receber',
  path: '/contas-a-receber'
}, {
  id: 'crediario_ativo',
  icon: ArrowLeftRight,
  label: 'Contas a Pagar',
  path: '/contas-a-pagar'
}, {
  id: 'clientes_ativo',
  icon: Users,
  label: 'Clientes',
  path: '/clientes'
}, {
  id: 'fornecedores_ativo',
  icon: Truck,
  label: 'Fornecedores',
  path: '/fornecedores'
}, {
  id: 'estoque_ativo',
  icon: Package,
  label: 'Estoque',
  path: '/estoque'
}, {
  id: 'recorrentes_ativo',
  icon: CalendarClock,
  label: 'Recorrentes',
  path: '/recorrentes'
}, {
  id: 'relatorios_ativo',
  icon: BarChart3,
  label: 'Relatórios',
  path: '/relatorios'
}, {
  id: 'dre_ativo',
  icon: FileText,
  label: 'DRE',
  path: '/dre'
}, {
  id: 'fluxo_de_caixa_ativo',
  icon: AreaChart,
  label: 'Fluxo de Caixa',
  path: '/fluxo-de-caixa'
}, {
  id: 'planejamento_orcamentario_ativo',
  icon: Target,
  label: 'Planejamento',
  path: '/planejamento-orcamentario'
}, {
  id: 'ia_ativo',
  icon: Sparkles,
  label: 'IA',
  path: '/ia'
}, {
  id: 'disparos_ativo',
  icon: Send,
  label: 'Disparos',
  path: '/disparos'
}, {
  id: 'configuracoes_ativo',
  icon: Settings,
  label: 'Configurações',
  path: '/configuracoes'
}];
const adminMenuItem = {
  id: 'admin_panel',
  icon: ShieldCheck,
  label: 'Painel Admin',
  path: '/admin'
};
const superAdminMenuItem = {
  id: 'super_admin_panel',
  icon: Shield,
  label: 'Super Admin',
  path: '/super-admin'
};
const MobileBottomNav = ({
  onMenuClick,
  onLancamentoClick,
  onDashboardClick
}) => {
  const location = useLocation();
  return <div className="fixed bottom-0 left-0 right-0 h-[calc(60px+env(safe-area-inset-bottom))] bg-slate-800/80 backdrop-blur-lg border-t border-slate-700 flex items-start justify-around text-gray-400 z-50 lg:hidden pt-2 pb-[env(safe-area-inset-bottom)]">
      <button onClick={onDashboardClick} className={`flex flex-1 flex-col items-center justify-center space-y-1 ${location.pathname === '/dashboard' ? 'text-emerald-400' : ''}`}>
        <Home className="w-6 h-6" />
        <span className="text-xs font-medium">Início</span>
      </button>

      <div className="flex-1 flex justify-center items-center h-full relative -mt-8">
        <button onClick={onLancamentoClick} className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 transform transition-transform hover:scale-105" aria-label="Novo Lançamento">
          <Plus className="w-8 h-8" />
        </button>
      </div>

      <button onClick={onMenuClick} className="flex flex-1 flex-col items-center justify-center space-y-1">
        <Menu className="w-6 h-6" />
        <span className="text-xs font-medium">Mais</span>
      </button>
    </div>;
};
const MobileFullScreenMenu = ({
  isOpen,
  onClose,
  menuItems,
  user,
  handleSignOut
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const handleNavigation = path => {
    navigate(path);
    onClose();
  };
  return <AnimatePresence>
      {isOpen && <motion.div initial={{
      y: '100%'
    }} animate={{
      y: 0
    }} exit={{
      y: '100%'
    }} transition={{
      duration: 0.3,
      ease: 'easeInOut'
    }} className="fixed inset-0 z-50 flex flex-col bg-slate-900 lg:hidden">
          <header className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">Menu</h1>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-6 h-6" />
            </Button>
          </header>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-visible">
            {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return <div key={item.path} onClick={() => handleNavigation(item.path)}>
                  <motion.div whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} className={`flex items-center space-x-4 p-3 rounded-lg transition-all ${isActive ? 'gradient-bg text-white shadow-lg' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}>
                    <Icon className="w-5 h-5" />
                    <span className="text-base font-medium">{item.label}</span>
                  </motion.div>
                </div>;
        })}
          </nav>
          <div className="p-4 border-t border-white/10 space-y-4">
            <div className="text-sm text-gray-400 truncate">
              <p>Logado como:</p>
              <p className="font-semibold text-gray-300">{user?.email}</p>
            </div>
            <Button variant="outline" className="w-full text-lg py-6" onClick={handleSignOut}>
              <LogOut className="w-5 h-5 mr-3" />
              Sair
            </Button>
          </div>
        </motion.div>}
    </AnimatePresence>;
};
function Layout({
  children
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location = useLocation();
  const {
    signOut,
    user,
    userRole
  } = useAuth();
  const {
    settings
  } = useAppContext();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const menuItems = menuItemsConfig.filter(item => item.id === 'configuracoes_ativo' || settings?.[item.id] !== false).map(item => ({
    ...item
  }));
  if (userRole === 'admin') {
    menuItems.push(adminMenuItem);
  }
  if (user?.email === 'josiasbonfim61@gmail.com') {
    menuItems.push(superAdminMenuItem);
  }
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      if (error.message.includes("session_not_found")) {
        console.warn("Sessão já expirada no servidor, fazendo logout local.");
      } else {
        console.error("Erro ao fazer logout:", error);
        toast({
          title: "Erro ao sair",
          description: "Ocorreu um erro inesperado. Tente novamente.",
          variant: "destructive"
        });
      }
    } finally {
      sessionStorage.removeItem('superAdminAuthenticated');
      navigate('/login');
    }
  };
  const handleLancamentoClick = () => {
    if (location.pathname === '/lancamentos') {
      navigate('?action=new', {
        replace: true
      });
    } else {
      navigate('/lancamentos?action=new');
    }
  };
  const sidebarVariants = {
    collapsed: {
      width: '5rem'
    },
    expanded: {
      width: '16rem'
    }
  };
  return <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      <TooltipProvider>
        <motion.aside className="hidden lg:flex lg:flex-shrink-0" initial="collapsed" animate={isCollapsed ? "collapsed" : "expanded"} variants={sidebarVariants} transition={{
        duration: 0.3,
        ease: "easeInOut"
      }} onMouseEnter={() => setIsCollapsed(false)} onMouseLeave={() => setIsCollapsed(true)}>
          <div className="flex w-full flex-col">
            <div className="flex h-full flex-col glass-effect overflow-hidden">
              <div className={`flex items-center border-b border-white/10 h-[73px] transition-all duration-300 ${isCollapsed ? 'justify-center px-2' : 'px-6'}`}>
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <AnimatePresence>
                    {!isCollapsed && <motion.div initial={{
                    opacity: 0,
                    x: -20
                  }} animate={{
                    opacity: 1,
                    x: 0
                  }} exit={{
                    opacity: 0,
                    x: -20
                  }}>
                        <h1 className="text-xl font-bold text-gradient whitespace-nowrap">JB APEX</h1>
                        <p className="text-xs text-gray-400 whitespace-nowrap">Financeiro</p>
                      </motion.div>}
                  </AnimatePresence>
                </div>
              </div>
              <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto scrollbar-visible">
                {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return <Tooltip key={item.path} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Link to={item.path}>
                          <motion.div whileHover={{
                        scale: 1.02
                      }} whileTap={{
                        scale: 0.98
                      }} className={`flex items-center h-12 rounded-lg transition-all overflow-hidden ${isActive ? 'gradient-bg text-white shadow-lg' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}>
                            <div className="w-20 h-full flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5" />
                            </div>
                            <AnimatePresence>
                              {!isCollapsed && <motion.span initial={{
                            opacity: 0,
                            x: -20
                          }} animate={{
                            opacity: 1,
                            x: 0
                          }} exit={{
                            opacity: 0,
                            x: -20
                          }} className="font-medium whitespace-nowrap">
                                  {item.label}
                                </motion.span>}
                            </AnimatePresence>
                          </motion.div>
                        </Link>
                      </TooltipTrigger>
                      {isCollapsed && <TooltipContent side="right"><p>{item.label}</p></TooltipContent>}
                    </Tooltip>;
              })}
              </nav>
              <div className="p-4 border-t border-white/10 space-y-4">
                <AnimatePresence>
                  {!isCollapsed && <motion.div initial={{
                  opacity: 0,
                  y: 20
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: 20
                }} className="text-xs text-gray-400 truncate">
                      <p>Logado como:</p>
                      <p className="font-semibold text-gray-300">{user?.email}</p>
                    </motion.div>}
                </AnimatePresence>
                <Button variant="outline" className="w-full justify-center" onClick={handleSignOut}>
                  <LogOut className={`w-4 h-4 ${!isCollapsed ? 'mr-2' : ''}`} />
                  <AnimatePresence>
                    {!isCollapsed && <motion.span initial={{
                    width: 0,
                    opacity: 0
                  }} animate={{
                    width: 'auto',
                    opacity: 1
                  }} exit={{
                    width: 0,
                    opacity: 0
                  }} className="whitespace-nowrap">Sair</motion.span>}
                  </AnimatePresence>
                </Button>
                <AnimatePresence>
                  {!isCollapsed && <motion.div initial={{
                  opacity: 0
                }} animate={{
                  opacity: 1
                }} exit={{
                  opacity: 0
                }} className="text-center text-xs text-gray-400">
                      <p>© 2025 JB APEX</p>
                      <p>Versão 2.5</p>
                    </motion.div>}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.aside>
      </TooltipProvider>

      <MobileFullScreenMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} menuItems={menuItems} user={user} handleSignOut={handleSignOut} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 glass-effect border-b border-white/10 p-2 xs:p-4 lg:hidden">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gradient">JB APEX</span>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-[80px] lg:pb-0">
          <div className="w-full max-w-full px-2 xs:px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
        
        {isMobile && !mobileMenuOpen && <MobileBottomNav onMenuClick={() => setMobileMenuOpen(true)} onLancamentoClick={handleLancamentoClick} onDashboardClick={() => navigate('/dashboard')} />}

      </div>
    </div>;
}
export default Layout;