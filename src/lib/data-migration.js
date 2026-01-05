import { supabase } from '@/lib/customSupabaseClient';

const getFromLocalStorage = (key, defaultValue) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error reading localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const getInitialCategorias = () => {
    return getFromLocalStorage('categorias', {
        entradas: ['VENDAS', 'SERVIÇOS', 'OUTRAS ENTRADAS', 'RENDIMENTOS APL FINANCEIROS'],
        saidas: ['IMPOSTOS', 'MARKETING', 'SALÁRIOS', 'CUSTOS', 'OUTRAS SAÍDAS']
    });
};

const getInitialClientes = () => {
    return getFromLocalStorage('clientes', []);
};

const getLancamentosFromLocalStorage = () => {
    return getFromLocalStorage('lancamentos', []);
};

export const migrateLocalStorageToSupabase = async (user) => {
    if (!user) {
        console.error("Usuário não autenticado. Abortando migração.");
        return;
    }

    const migrationFlag = `migration_completed_for_${user.id}`;
    if (localStorage.getItem(migrationFlag)) {
        console.log("A migração já foi realizada para este usuário.");
        return;
    }

    console.log("Iniciando migração de dados do localStorage para o Supabase...");

    try {
        const localCategorias = getInitialCategorias();
        if (localCategorias && (localCategorias.entradas?.length > 0 || localCategorias.saidas?.length > 0)) {
            const categoriasParaInserir = [];
            for (const nome of localCategorias.entradas) {
                categoriasParaInserir.push({ user_id: user.id, nome, tipo: 'entrada' });
            }
            for (const nome of localCategorias.saidas) {
                categoriasParaInserir.push({ user_id: user.id, nome, tipo: 'saida' });
            }
            if (categoriasParaInserir.length > 0) {
                await supabase.from('categorias').upsert(categoriasParaInserir, { onConflict: 'user_id,nome,tipo' });
            }
            console.log("Categorias migradas com sucesso.");
        }

        const localClientes = getInitialClientes();
        if (Array.isArray(localClientes) && localClientes.length > 0) {
            const clientesParaInserir = localClientes.map(nome => ({ user_id: user.id, nome }));
            if (clientesParaInserir.length > 0) {
                await supabase.from('clientes').upsert(clientesParaInserir, { onConflict: 'user_id,nome' });
            }
            console.log("Clientes migrados com sucesso.");
        }

        const { data: supabaseCategorias } = await supabase.from('categorias').select('id, nome, tipo').eq('user_id', user.id);
        const { data: supabaseClientes } = await supabase.from('clientes').select('id, nome').eq('user_id', user.id);
        
        const categoriaMap = supabaseCategorias.reduce((acc, cat) => {
            acc[`${cat.tipo}-${cat.nome}`] = cat.id;
            return acc;
        }, {});
        
        const clienteMap = supabaseClientes.reduce((acc, cli) => {
            acc[cli.nome] = cli.id;
            return acc;
        }, {});

        const localLancamentos = getLancamentosFromLocalStorage();
        if (Array.isArray(localLancamentos) && localLancamentos.length > 0) {
            const lancamentosParaInserir = localLancamentos.map(l => ({
                user_id: user.id,
                descricao: l.descricao,
                valor: l.valor,
                data: l.data,
                tipo: l.tipo,
                categoria_id: categoriaMap[`${l.tipo}-${l.categoria}`] || null,
                cliente_id: clienteMap[l.cliente] || null,
            }));
            
            if (lancamentosParaInserir.length > 0) {
                const { error } = await supabase.from('lancamentos').insert(lancamentosParaInserir);
                if (error) throw error;
            }
            console.log("Lançamentos migrados com sucesso.");
        }

        localStorage.setItem(migrationFlag, 'true');
        console.log("Migração concluída e flag definida.");

    } catch (error) {
        console.error("Erro durante a migração de dados:", error);
    }
};