import React from 'react';
    import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
    import { Helmet } from 'react-helmet';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useAppContext } from '@/contexts/AppContext';

    import Layout from '@/components/Layout';
    import Login from '@/pages/Login';
    import SignUp from '@/pages/SignUp';
    import ForgotPassword from '@/pages/ForgotPassword';
    import UpdatePassword from '@/pages/UpdatePassword';
    import Dashboard from '@/pages/Dashboard';
    import Lancamentos from '@/pages/Lancamentos';
    import Clientes from '@/pages/Clientes';
    import Relatorios from '@/pages/Relatorios';
    import DRE from '@/pages/DRE';
    import IA from '@/pages/IA';
    import Configuracoes from '@/pages/Configuracoes';
    import AdminPanel from '@/pages/AdminPanel';
    import Notificacoes from '@/pages/Notificacoes';
    import Disparos from '@/pages/Disparos';
    import FluxoDeCaixa from '@/pages/FluxoDeCaixa';
    import PlanejamentoOrcamentario from '@/pages/PlanejamentoOrcamentario';
    import Fornecedores from '@/pages/Fornecedores';
    import Estoque from '@/pages/Estoque';
    
    import ContasReceber from '@/pages/ContasReceber';
    import ContasPagar from '@/pages/ContasPagar';
    import ContasBancarias from '@/pages/ContasBancarias';
    import ConciliacaoBancaria from '@/pages/ConciliacaoBancaria';
    import PagamentosRecorrentes from '@/pages/PagamentosRecorrentes';

    import SuperAdminLogin from '@/pages/SuperAdminLogin';
    import SuperAdminLayout from '@/components/super-admin/SuperAdminLayout';
    import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
    import SuperAdminUsersAndPlans from '@/pages/SuperAdminUsersAndPlans';
    import SuperAdminPlans from '@/pages/SuperAdminPlans';
    import SuperAdminBilling from '@/pages/SuperAdminBilling';
    import SuperAdminModules from '@/pages/SuperAdminModules';
    import SuperAdminGlobalSettings from '@/pages/SuperAdminGlobalSettings';
    import SuperAdminIntegrations from '@/pages/SuperAdminIntegrations';

    const AuthLayout = ({ children }) => (
      <div className="flex min-h-screen items-center justify-center p-4 bg-slate-900 bg-grid-pattern">
        {children}
      </div>
    );

    const PublicRoute = ({ children }) => {
      return children;
    };

    const ProtectedRoute = ({ children }) => {
      const { user, loading } = useAuth();

      if (loading) {
        return <div className="flex items-center justify-center h-screen bg-slate-900"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div></div>; 
      }

      return user ? children : <Navigate to="/login" />;
    };

    const AdminRoute = ({ children }) => {
      const { user, loading, userRole } = useAuth();

      if (loading) {
        return <div className="flex items-center justify-center h-screen bg-slate-900"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div></div>;
      }

      return user && userRole === 'admin' ? children : <Navigate to="/" />;
    };

    const SuperAdminRoute = ({ children }) => {
      const isAuthenticated = sessionStorage.getItem('superAdminAuthenticated') === 'true';
      return isAuthenticated ? children : <Navigate to="/super-admin-login" />;
    };


    const AuthRoute = ({ children }) => {
      const { user, loading } = useAuth();
      
      if (loading) {
        return <div className="flex items-center justify-center h-screen bg-slate-900"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div></div>;
      }
      
      return !user ? <AuthLayout>{children}</AuthLayout> : <Navigate to="/" />;
    }
    
    const SuperAdminSupportPlaceholder = () => <div className="text-center text-gray-400">Painel de Suporte em construção... 🚧</div>;
    const SuperAdminToolsPlaceholder = () => <div className="text-center text-gray-400">Painel de Ferramentas em construção... 🚧</div>;

    function App() {
      const { settings } = useAppContext();

      return (
        <>
          <Helmet>
            <title>JB APEX Financeiro - Gestão Financeira Completa</title>
            <meta name="description" content="Sistema completo de gestão financeira para agência JB APEX com controle de lançamentos, clientes, relatórios e DRE." />
          </Helmet>
          <Router>
            <Routes>
              <Route element={<AuthRoute><Outlet /></AuthRoute>}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/update-password" element={<UpdatePassword />} />
              </Route>
              
              <Route element={<PublicRoute><Outlet/></PublicRoute>}>
                <Route path="/super-admin-login" element={<SuperAdminLogin />} />
              </Route>
              
              <Route path="/super-admin" element={<SuperAdminRoute><SuperAdminLayout /></SuperAdminRoute>}>
                <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
                <Route path="dashboard" element={<SuperAdminDashboard />} />
                <Route path="users-and-plans" element={<SuperAdminUsersAndPlans />} />
                <Route path="plans" element={<SuperAdminPlans />} />
                <Route path="modules" element={<SuperAdminModules />} />
                <Route path="billing" element={<SuperAdminBilling />} />
                <Route path="global-settings" element={<SuperAdminGlobalSettings />} />
                <Route path="integrations" element={<SuperAdminIntegrations />} />
                <Route path="support" element={<SuperAdminSupportPlaceholder />} />
                <Route path="tools" element={<SuperAdminToolsPlaceholder />} />
              </Route>

              <Route element={<ProtectedRoute><Layout><Outlet /></Layout></ProtectedRoute>}>
                <Route path="/" element={<Navigate to={settings?.dashboard_ativo ? "/dashboard" : "/lancamentos"} replace />} />
                {settings?.dashboard_ativo && <Route path="/dashboard" element={<Dashboard />} />}
                {settings?.lancamentos_ativo && <Route path="/lancamentos" element={<Lancamentos />} />}
                {settings?.contas_bancarias_ativo && <Route path="/contas-bancarias" element={<ContasBancarias />} />}
                {settings?.conciliacao_bancaria_ativo && <Route path="/conciliacao-bancaria" element={<ConciliacaoBancaria />} />}
                {settings?.crediario_ativo && <Route path="/contas-a-receber" element={<ContasReceber />} />}
                {settings?.crediario_ativo && <Route path="/contas-a-pagar" element={<ContasPagar />} />}
                {settings?.clientes_ativo && <Route path="/clientes" element={<Clientes />} />}
                {settings?.fornecedores_ativo && <Route path="/fornecedores" element={<Fornecedores />} />}
                {settings?.estoque_ativo && <Route path="/estoque" element={<Estoque />} />}
                {settings?.recorrentes_ativo && <Route path="/recorrentes" element={<PagamentosRecorrentes />} />}
                {settings?.relatorios_ativo && <Route path="/relatorios" element={<Relatorios />} />}
                {settings?.dre_ativo && <Route path="/dre" element={<DRE />} />}
                {settings?.fluxo_de_caixa_ativo && <Route path="/fluxo-de-caixa" element={<FluxoDeCaixa />} />}
                {settings?.planejamento_orcamentario_ativo && <Route path="/planejamento-orcamentario" element={<PlanejamentoOrcamentario />} />}
                {settings?.ia_ativo && <Route path="/ia" element={<IA />} />}
                {settings?.disparos_ativo && <Route path="/disparos" element={<Disparos />} />}
                <Route path="/notificacoes" element={<Notificacoes />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
                <Route 
                  path="/admin" 
                  element={
                    <AdminRoute>
                      <AdminPanel />
                    </AdminRoute>
                  } 
                />
              </Route>
            </Routes>
          </Router>
        </>
      );
    }

export default App;