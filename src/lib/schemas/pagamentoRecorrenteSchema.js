import { z } from 'zod';

export const pagamentoRecorrenteSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  nome: z.string().min(1, { message: "O nome é obrigatório." }),
  valor: z.preprocess(
    (val) => (typeof val === 'string' && val.trim() !== '' ? parseFloat(val) : val),
    z.number({ invalid_type_error: "O valor deve ser um número." }).positive({ message: "O valor deve ser positivo." })
  ),
  categoria_id: z.string().min(1, { message: "Selecione uma categoria." }),
  fornecedor_id: z.string().uuid().optional().nullable(),
  frequencia: z.enum(['mensal', 'semanal'], { required_error: "A frequência é obrigatória." }),
  dia_vencimento: z.preprocess(
    (val) => (typeof val === 'string' && val.trim() !== '' ? parseInt(val, 10) : val),
    z.number({ invalid_type_error: "O dia do vencimento é obrigatório." }).int()
  ),
  ativo: z.boolean(),
}).refine(data => {
    if (data.frequencia === 'mensal') {
        return data.dia_vencimento >= 1 && data.dia_vencimento <= 31;
    }
    return true;
}, {
    message: "Para frequência mensal, o dia deve ser entre 1 e 31.",
    path: ["dia_vencimento"],
})
.refine(data => {
    if (data.frequencia === 'semanal') {
        return data.dia_vencimento >= 0 && data.dia_vencimento <= 6;
    }
    return true;
}, {
    message: "Para frequência semanal, o dia deve ser entre 0 (Domingo) e 6 (Sábado).",
    path: ["dia_vencimento"],
});