import { supabase } from '@/lib/customSupabaseClient';
import { getUserId } from './api';

export const categoriaService = {
  getCategorias: async () => {
    const { data, error } = await supabase.from('categorias').select('id, nome, tipo');
    if (error) {
      console.error("Erro ao buscar categorias:", error);
      return { entradas: [], saidas: [], raw: [] };
    }
    const grouped = data.reduce((acc, cat) => {
      const key = cat.tipo === 'entrada' ? 'entradas' : 'saidas';
      if (!acc[key].includes(cat.nome)) {
          acc[key].push(cat.nome);
      }
      return acc;
    }, { entradas: [], saidas: [] });

    return { ...grouped, raw: data };
  },

  saveCategoria: async (tipo, nome) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");
    if (!tipo || !nome) throw new Error("Tipo e nome da categoria são obrigatórios.");

    const { data, error } = await supabase
      .from('categorias')
      .upsert({ nome: nome, tipo: tipo, user_id: userId }, { onConflict: 'nome,tipo,user_id' })
      .select()
      .single();
      
    if (error) {
        if (error.code === '23505') {
            throw new Error(`A categoria "${nome}" já existe para o tipo "${tipo}".`);
        }
        throw error;
    }
    return data;
  },

  saveCategoriasEmMassa: async (categorias) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");

    const categoriasParaInserir = categorias.map(cat => ({
      nome: cat.nome,
      tipo: cat.tipo,
      user_id: userId,
    }));

    const { data, error } = await supabase
      .from('categorias')
      .upsert(categoriasParaInserir, { onConflict: 'nome,tipo,user_id', ignoreDuplicates: true })
      .select();

    if (error) {
      throw error;
    }

    const successCount = data ? data.length : 0;
    const errorCount = categorias.length - successCount;

    return {
      successCount,
      errorCount,
      errorDetails: [], 
    };
  },

  deleteCategoria: async (nome, tipo) => {
    const userId = await getUserId();
    if (!userId) throw new Error("Usuário não autenticado.");
    const { error } = await supabase.from('categorias').delete().match({ nome: nome, tipo: tipo, user_id: userId });
    
    if (error) {
      if (error.code === '23503') {
        throw new Error('Esta categoria não pode ser removida pois está sendo utilizada em lançamentos, contas recorrentes ou orçamentos.');
      }
      throw error;
    }
  },

  findCategoriaId: async (nome, tipo, createIfNotFound = false) => {
    if (!nome || nome === 'none' || nome === 'Nenhuma' || typeof nome !== 'string' || nome.trim() === '') return null;
    const userId = await getUserId();
    if (!userId) return null;

    const { data, error } = await supabase.from('categorias').select('id').match({ nome: nome.trim(), tipo, user_id: userId }).maybeSingle();

    if(error){
        console.error('Erro ao buscar categoria ID:', error);
    }
    if (data) return data.id;

    if (createIfNotFound) {
      const { data: newData, error: newError } = await supabase.from('categorias').upsert({ nome: nome.trim(), tipo, user_id: userId }, { onConflict: 'nome,tipo,user_id' }).select('id').single();
      if (newError) {
        console.error('Erro ao criar nova categoria:', newError);
        return null;
      }
      return newData.id;
    }

    return null;
  },
};