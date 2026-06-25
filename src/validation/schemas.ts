import { z } from 'zod';

const cepSchema = z
  .string()
  .min(1)
  .refine((value) => value.replace(/\D/g, '').length >= 8, {
    message: 'CEP must contain at least 8 digits',
  });

const ufSchema = z
  .string()
  .length(2)
  .regex(/^[A-Za-z]{2}$/, 'UF must be a 2-letter state code');

export const partySchema = z.object({
  nome: z.string().min(1),
  logradouro: z.string().min(1),
  numero: z.string().min(1),
  complemento: z.string().optional(),
  bairro: z.string().min(1),
  cidade: z.string().min(1),
  uf: ufSchema,
  cep: cepSchema,
  referencia: z.string().optional(),
  ddd: z.string().optional(),
  telefone: z.string().optional(),
  dddCelular: z.string().optional(),
  celular: z.string().optional(),
  email: z.string().optional(),
  identificacao: z.string().optional(),
  sms: z.boolean().optional(),
});

export const collectionItemSchema = z.object({
  item: z.number().int().positive().optional(),
  desc: z.string().optional(),
  entrega: z.string().optional(),
  num: z.string().optional(),
  id: z.string().optional(),
});

export const collectionRequestSchema = z.object({
  tipo: z.literal('A').optional(),
  ag: z.union([z.number().positive(), z.string().min(1)]),
  valorDeclarado: z.number().positive().optional(),
  servicoAdicional: z.string().optional(),
  ar: z.union([z.number(), z.string()]).optional(),
  remetente: partySchema,
  objCol: collectionItemSchema.optional(),
});

export const issueAuthorizationInputSchema = z.object({
  destinatario: partySchema,
  coleta: collectionRequestSchema,
  codigoServico: z.string().min(1).optional(),
});

export const trackByOrderNumberInputSchema = z.object({
  numeroPedido: z.union([z.string().min(1), z.number()]),
  tipoBusca: z.literal('H').optional(),
  tipoSolicitacao: z.literal('A').optional(),
});

export const trackByDateInputSchema = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'data must be YYYY-MM-DD'),
  tipoSolicitacao: z.literal('A').optional(),
});

export const cancelOrderInputSchema = z.object({
  numeroPedido: z.union([z.string().min(1), z.number()]),
  tipo: z.literal('A').optional(),
});