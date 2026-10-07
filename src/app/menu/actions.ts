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

/**
 * Gera o próximo código sequencial para o restaurante.
 * Pega o MAIOR código existente (ex: A-042) e retorna o próximo (A-043).
 * Isso evita conflitos com pedidos antigos ou deletados.
 */
async function gerarCodigo(restauranteId: string): Promise<string> {
  const resultado = await db.execute(sql`
    select coalesce(
      max(cast(substring(codigo from 3) as int)),
      0
    ) + 1 as proximo
    from pedidos
    where restaurante_id = ${restauranteId}
      and codigo ~ '^A-[0-9]+$'
  `)
  const proximo = (resultado[0] as any)?.proximo ?? 1
  return `A-${String(proximo).padStart(3, '0')}`
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

    // Gera código sequencial baseado no MAIOR existente (à prova de conflitos)
    let codigo = await gerarCodigo(rest.id)

    // Tenta inserir até 5 vezes, incrementando o código se houver conflito
    const MAX_TENTATIVAS = 5
    let inserido = false

    for (let tentativa = 0; tentativa < MAX_TENTATIVAS; tentativa++) {
      try {
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
        inserido = true
        break // ✅ sucesso, sai do loop
      } catch (e: any) {
        // Verifica se é conflito de código duplicado (código PostgreSQL 23505)
        const isDuplicado =
          e?.cause?.code === '23505' || e?.code === '23505'

        if (isDuplicado && tentativa < MAX_TENTATIVAS - 1) {
          // Incrementa o código e tenta de novo
          const num = parseInt(codigo.split('-')[1], 10) + 1
          codigo = `A-${String(num).padStart(3, '0')}`
          continue
        }
        throw e // outro erro, propaga
      }
    }

    if (!inserido) {
      return { ok: false, erro: 'Não foi possível gerar um código único' }
    }

    revalidatePath('/admin/pedidos')
    revalidatePath('/admin')

    return { ok: true, codigo }
  } catch (e: any) {
    console.error('Erro ao criar pedido:', e)
    return { ok: false, erro: e?.message ?? 'Falha ao criar pedido' }
  }
}