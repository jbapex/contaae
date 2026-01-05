const SYSTEM_PROMPT = `
Você é o "Conselheiro Apex", um especialista em finanças e assistente de IA para a plataforma JB Apex Financeiro. Sua missão é fornecer insights claros, acionáveis e amigáveis para ajudar os usuários a entender e melhorar sua saúde financeira. Você tem acesso a todos os dados do sistema do usuário logado.

**Diretrizes de Comunicação:**
- **Tom de Voz:** Seja profissional, mas acessível e encorajador. Use uma linguagem simples, evitando jargões financeiros complexos.
- **Formato:** Use markdown para formatar suas respostas. Use negrito (**), itálico (*), e listas de marcadores (-) para tornar a informação fácil de ler.
- **Análise de Dados:** Baseie suas respostas estritamente nos dados fornecidos do sistema. Seja factual. Se os dados não existirem para uma pergunta, informe que não há dados disponíveis para essa análise. Não invente informações.
- **Privacidade:** Nunca peça informações pessoais ou sensíveis.
- **Segurança:** Se um pedido for ambíguo ou parecer fora do escopo financeiro, peça esclarecimentos ou recuse educadamente.

**Dados Disponíveis para Análise:**
Você tem acesso a uma visão completa e em tempo real de todos os módulos do sistema do usuário:
1.  **Lançamentos:** Todas as transações (entradas e saídas), incluindo valores, datas, descrições, categorias, clientes e fornecedores vinculados.
2.  **Clientes:** Lista completa de clientes, incluindo em que etapa do funil (Kanban) eles estão.
3.  **Fornecedores:** Lista de todos os fornecedores cadastrados.
4.  **Categorias:** Todas as categorias de receita e despesa criadas pelo usuário.
5.  **Pagamentos Recorrentes:** Todos os compromissos financeiros programados (aluguéis, salários, assinaturas).
6.  **Planejamento Orçamentário:** Metas de receita e despesa definidas para cada categoria no mês, comparadas com os valores já realizados.
7.  **DRE (Demonstração do Resultado do Exercício):** Você pode montar uma DRE para qualquer período, calculando receitas, despesas, lucro e margem de lucro.
8.  **Fluxo de Caixa:** Você pode analisar o fluxo de caixa, mostrando o saldo acumulado ao longo do tempo.
9.  **Disparos e Relatórios:** Você tem ciência das funcionalidades de disparos manuais e automáticos de relatórios.

**Exemplos de Perguntas que Você Pode Responder:**
- "Qual foi meu lucro em maio?"
- "Liste minhas 3 maiores despesas este mês e a quais fornecedores elas pertencem."
- "O cliente 'Empresa X' está em qual etapa do funil e qual foi a receita que ele gerou?"
- "Estou dentro do meu orçamento de marketing para este mês? Quanto ainda posso gastar?"
- "Qual o valor total dos meus pagamentos recorrentes para o próximo mês?"
- "Gere um DRE simplificado para o último trimestre."
- "Mostre a evolução do meu fluxo de caixa nos últimos 15 dias."
- "Me dê um resumo da minha saúde financeira geral, considerando DRE, fluxo de caixa e orçamento."

Responda sempre em português do Brasil.
`;

export class IAgent {
  constructor(systemData, history) {
    this.systemData = systemData;
    this.history = history;
  }

  prepareDataForPrompt() {
    const { lancamentos, clientes, categorias, fornecedores, pagamentosRecorrentes, orcamentoMensal, etapas } = this.systemData;
    
    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

    const resumoLancamentos = {
        total: lancamentos.length,
        totalEntradas: lancamentos.filter(l => l.tipo === 'entrada').reduce((sum, l) => sum + l.valor, 0),
        totalSaidas: lancamentos.filter(l => l.tipo === 'saida').reduce((sum, l) => sum + l.valor, 0),
        lancamentosRecentes: lancamentos.slice(0, 5).map(l => `${l.descricao}: ${formatCurrency(l.valor)} (${l.tipo})`)
    };

    const resumoClientes = {
        total: clientes.length,
        etapas: etapas.map(e => ({ nome: e.nome, quantidade: clientes.filter(c => c.etapa_id === e.id).length })),
    };

    const resumoCategorias = {
        entradas: categorias.entradas.length,
        saidas: categorias.saidas.length,
        principaisCategoriasSaida: Object.entries(
            lancamentos.filter(l => l.tipo === 'saida' && l.categoria)
                       .reduce((acc, l) => { acc[l.categoria.nome] = (acc[l.categoria.nome] || 0) + l.valor; return acc; }, {})
        ).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([nome, valor]) => `${nome}: ${formatCurrency(valor)}`)
    };

    const resumoFornecedores = {
        total: fornecedores.length,
        principaisFornecedores: Object.entries(
            lancamentos.filter(l => l.tipo === 'saida' && l.fornecedor)
                       .reduce((acc, l) => { acc[l.fornecedor.nome] = (acc[l.fornecedor.nome] || 0) + l.valor; return acc; }, {})
        ).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([nome, valor]) => `${nome}: ${formatCurrency(valor)}`)
    };

    const resumoRecorrentes = {
        total: pagamentosRecorrentes.length,
        valorTotalMensal: pagamentosRecorrentes.filter(p => p.frequencia === 'mensal').reduce((sum, p) => sum + parseFloat(p.valor), 0),
    };

    const resumoOrcamento = {
        categoriasDefinidas: orcamentoMensal.filter(o => o.meta_despesa > 0 || o.meta_receita > 0).length,
        totalMetaDespesa: orcamentoMensal.reduce((sum, o) => sum + (o.meta_despesa || 0), 0),
        totalRealizadoDespesa: orcamentoMensal.reduce((sum, o) => sum + (o.realizado_despesa || 0), 0),
        totalMetaReceita: orcamentoMensal.reduce((sum, o) => sum + (o.meta_receita || 0), 0),
        totalRealizadoReceita: orcamentoMensal.reduce((sum, o) => sum + (o.realizado_receita || 0), 0),
    };

    const summaryContext = {
        resumoLancamentos,
        resumoClientes,
        resumoCategorias,
        resumoFornecedores,
        resumoRecorrentes,
        resumoOrcamento,
    };
    
    return `
    ## CONTEXTO RESUMIDO DO SISTEMA ##
    ${JSON.stringify(summaryContext, null, 2)}
    ## FIM DO CONTEXTO ##
    `;
  }

  async processMessage(userMessage) {
    const { iaService } = await import('@/lib/services/iaService.js');
    const contextData = this.prepareDataForPrompt();

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + '\n' + contextData },
      ...this.history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: userMessage }
    ];

    try {
      const data = await iaService.callOpenAIChat(messages);
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Erro ao contatar o serviço de IA:", error);
      throw new Error("Não foi possível conectar ao serviço de IA. Verifique sua chave de API e conexão com a internet.");
    }
  }
}