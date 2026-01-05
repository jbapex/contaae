import { LayoutDashboard, Receipt, Users, Truck, BarChart3, FileText, AreaChart, Target, Sparkles, Send, CreditCard, Landmark, ArrowLeftRight, CalendarClock, Package } from 'lucide-react';

export const availableModules = [
    { id: 'dashboard_ativo', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'lancamentos_ativo', label: 'Lançamentos', icon: Receipt },
    { id: 'clientes_ativo', label: 'Clientes', icon: Users },
    { id: 'fornecedores_ativo', label: 'Fornecedores', icon: Truck },
    { id: 'estoque_ativo', label: 'Estoque', icon: Package },
    { id: 'crediario_ativo', label: 'Crediário', icon: CreditCard },
    { id: 'contas_bancarias_ativo', label: 'Contas Bancárias', icon: Landmark },
    { id: 'conciliacao_bancaria_ativo', label: 'Conciliação', icon: ArrowLeftRight },
    { id: 'recorrentes_ativo', label: 'Recorrências', icon: CalendarClock },
    { id: 'relatorios_ativo', label: 'Relatórios', icon: BarChart3 },
    { id: 'dre_ativo', label: 'DRE', icon: FileText },
    { id: 'fluxo_de_caixa_ativo', label: 'Fluxo de Caixa', icon: AreaChart },
    { id: 'planejamento_orcamentario_ativo', label: 'Orçamento', icon: Target },
    { id: 'ia_ativo', label: 'Conselheiro IA', icon: Sparkles },
    { id: 'disparos_ativo', label: 'Disparos WhatsApp', icon: Send },
];