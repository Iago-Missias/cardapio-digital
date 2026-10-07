'use server'

import { db } from '@/db'
import { pedidos, restaurantes } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type ItemPedido = {
  produtoId: string
  nome: string
  precoBase: number
  quantidade: number
  opcoes: { grupo: string; item: string; preco: number }[]
  removidos: string[]
  observacao: string
  precoTotal: number
}

export async function criarPedido(input: {
  slug: string
  clienteNome: string
  clienteWhatsapp: string
  itens: ItemPedido[]
}): Promise<{ ok: true; codigo: string } | { ok: false; erro: string }> {
  try {
    const rest = await db.query.restaurantes.findFirst({
      where: eq(restaurantes.slug, input.slug),
    })

    if (!rest) return { ok: false, erro: 'Restaurante não encontrado' }

    if (!input.clienteNome.trim() || !input.clienteWhatsapp.trim()) {
      return { ok: false, erro: 'Preencha nome e WhatsApp' }
    }

    if (input.itens.length === 0) {
      return { ok: false, erro: 'Carrinho vazio' }
    }

    const total = input.itens.reduce((s, i) => s + i.precoTotal, 0)

    // Gera código sequencial do dia (A-001, A-002...)
    const hoje = new Date()
    const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())

    const resultado = await db.execute(sql`
      select count(*)::int as total
      from pedidos
      where restaurante_id = ${rest.id}
        and criado_em >= ${inicioDia.toISOString()}
    `)

    const count = (resultado[0] as any)?.total ?? 0
    const numero = String(count + 1).padStart(3, '0')
    const codigo = `A-${numero}`

    await db.insert(pedidos).values({
      restauranteId: rest.id,
      codigo,
      clienteNome: input.clienteNome.trim(),
      clienteWhatsapp: input.clienteWhatsapp.replace(/\D/g, ''),
      itens: input.itens,
      subtotal: total.toFixed(2),
      total: total.toFixed(2),
      status: 'aguardando_pagamento',
      metodoPagamento: 'local',
    })

    revalidatePath('/admin/pedidos')
    revalidatePath('/admin')

    return { ok: true, codigo }
  } catch (e: any) {
    console.error('Erro ao criar pedido:', e)
    return { ok: false, erro: e?.message ?? 'Falha ao criar pedido' }
  }
}
