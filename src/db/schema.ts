import {
  pgTable, uuid, text, numeric, boolean, integer, timestamp, jsonb
} from 'drizzle-orm/pg-core'

export const restaurantes = pgTable('restaurantes', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  nome: text('nome').notNull(),
  whatsapp: text('whatsapp'),
  logoUrl: text('logo_url'),
  corPrimaria: text('cor_primaria').default('#c0392b'),
  aberto: boolean('aberto').default(true),
  mpAccessToken: text('mp_access_token'),
  mpPublicKey: text('mp_public_key'),
  pixChave: text('pix_chave'),
  endereco: text('endereco'),
  tempoMedioMin: integer('tempo_medio_min').default(20),
  horarios: jsonb('horarios'),
  criadoEm: timestamp('criado_em').defaultNow(),
})

export const categorias = pgTable('categorias', {
  id: uuid('id').primaryKey().defaultRandom(),
  restauranteId: uuid('restaurante_id').references(() => restaurantes.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  ordem: integer('ordem').default(0),
})

export const produtos = pgTable('produtos', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoriaId: uuid('categoria_id').references(() => categorias.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  descricao: text('descricao'),
  preco: numeric('preco', { precision: 10, scale: 2 }).notNull(),
  imagemUrl: text('imagem_url'),
  disponivel: boolean('disponivel').default(true),
  ordem: integer('ordem').default(0),
  ingredientesRemoviveis: jsonb('ingredientes_removiveis').$type<string[]>().default([]),
  diasSemana: jsonb('dias_semana').$type<number[]>().default([]),
})

export const opcoesGrupos = pgTable('opcoes_grupos', {
  id: uuid('id').primaryKey().defaultRandom(),
  produtoId: uuid('produto_id').references(() => produtos.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  descricao: text('descricao'),
  tipo: text('tipo').notNull(),
  obrigatorio: boolean('obrigatorio').default(false),
  minEscolhas: integer('min_escolhas').default(0),
  maxEscolhas: integer('max_escolhas').default(1),
  ordem: integer('ordem').default(0),
})

export const opcoesItens = pgTable('opcoes_itens', {
  id: uuid('id').primaryKey().defaultRandom(),
  grupoId: uuid('grupo_id').references(() => opcoesGrupos.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  precoAdicional: numeric('preco_adicional', { precision: 10, scale: 2 }).default('0.00'),
  padrao: boolean('padrao').default(false),
  disponivel: boolean('disponivel').default(true),
  ordem: integer('ordem').default(0),
})

export const pedidos = pgTable('pedidos', {
  id: uuid('id').primaryKey().defaultRandom(),
  restauranteId: uuid('restaurante_id').references(() => restaurantes.id),
  codigo: text('codigo').notNull().unique(),
  clienteNome: text('cliente_nome').notNull(),
  clienteWhatsapp: text('cliente_whatsapp').notNull(),
  observacao: text('observacao'),
  itens: jsonb('itens').notNull(),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('aguardando_pagamento'),
  metodoPagamento: text('metodo_pagamento'),
  mpPaymentId: text('mp_payment_id'),
  mpPreferenceId: text('mp_preference_id'),
  pagoEm: timestamp('pago_em'),
  criadoEm: timestamp('criado_em').defaultNow(),
  emPreparoEm: timestamp('em_preparo_em'),
  prontoEm: timestamp('pronto_em'),
  retiradoEm: timestamp('retirado_em'),
})

export const pagamentos = pgTable('pagamentos', {
  id: uuid('id').primaryKey().defaultRandom(),
  pedidoId: uuid('pedido_id').references(() => pedidos.id, { onDelete: 'cascade' }),
  mpPaymentId: text('mp_payment_id').unique(),
  status: text('status').notNull(),
  metodo: text('metodo'),
  valor: numeric('valor', { precision: 10, scale: 2 }).notNull(),
  payload: jsonb('payload'),
  criadoEm: timestamp('criado_em').defaultNow(),
})