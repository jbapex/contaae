import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { lancamentoService } from '@/lib/services/lancamentoService';
import { clienteService } from '@/lib/services/clienteService';
import { categoriaService } from '@/lib/services/categoriaService';
import { fornecedorService } from '@/lib/services/fornecedorService';
import { pagamentoRecorrenteService } from '@/lib/services/pagamentoRecorrenteService';
import { orcamentoService } from '@/lib/services/orcamentoService';
import { etapaService } from '@/lib/services/etapaService';
import { settingsService } from '@/lib/services/settingsService';
import { contasReceberService } from '@/lib/services/contasReceberService';
import { contasPagarService } from '@/lib/services/contasPagarService';
import { contaBancariaService } from '@/lib/services/contaBancariaService';
import { estoqueService } from '@/lib/services/estoqueService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState({
    lancamentos: [],
    clientes: [],
    categorias: { entradas: [], saidas: [], raw: [] },
    fornecedores: [],
    pagamentosRecorrentes: [],
    orcamentoMensal: [],
    etapas: [],
    settings: {},
    contasReceber: [],
    contasPagar: [],
    contasBancarias: [],
    produtos: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (user && !authLoading) {
      setLoading(true);
      try {
        const settings = await settingsService.getSettings();
        
        const dataPromises = [
          lancamentoService.getLancamentos(),
          clienteService.getClientes(),
          categoriaService.getCategorias(),
          fornecedorService.getFornecedores(),
          pagamentoRecorrenteService.getPagamentosRecorrentes(),
          orcamentoService.getOrcamentoCompleto(new Date()),
          etapaService.getEtapas(),
          Promise.resolve(settings),
        ];

        if (settings?.crediario_ativo) {
          dataPromises.push(contasReceberService.getContasReceber());
          dataPromises.push(contasPagarService.getContasPagar());
        } else {
          dataPromises.push(Promise.resolve([]));
          dataPromises.push(Promise.resolve([]));
        }

        if (settings?.contas_bancarias_ativo) {
          dataPromises.push(contaBancariaService.getContasBancarias());
        } else {
            dataPromises.push(Promise.resolve([]));
        }

        if (settings?.estoque_ativo) {
          dataPromises.push(estoqueService.getProdutos());
        } else {
          dataPromises.push(Promise.resolve([]));
        }

        const [
          lancamentos, 
          clientes, 
          categorias, 
          fornecedores, 
          pagamentosRecorrentes, 
          orcamentoMensal, 
          etapas,
          resolvedSettings,
          contasReceber,
          contasPagar,
          contasBancarias,
          produtos,
        ] = await Promise.all(dataPromises);

        setData({
          lancamentos,
          clientes,
          categorias,
          fornecedores,
          pagamentosRecorrentes,
          orcamentoMensal,
          etapas,
          settings: resolvedSettings,
          contasReceber,
          contasPagar,
          contasBancarias,
          produtos,
        });
      } catch (error) {
        console.error("Erro ao carregar dados da aplicação:", error);
      } finally {
        setLoading(false);
      }
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const value = {
    ...data,
    loading,
    refreshData: fetchData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};