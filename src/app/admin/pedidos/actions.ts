'use server'

import { db } from '@/db'
import { pedidos } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type StatusPedido =
  | 'aguardando_pagamento'
  | 'pago'
  | 'em_preparo'
  | 'pronto'
  | 'retirado'
  | 'cancelado'

export async function atualizarStatus(id: string, status: StatusPedido) {
  const update: any = { status }

  if (status === 'pago') update.pagoEm = new Date()
  if (status === 'em_preparo') update.emPreparoEm = new Date()
  if (status === 'pronto') update.prontoEm = new Date()
  if (status === 'retirado') update.retiradoEm = new Date()

  await db.update(pedidos).set(update).where(eq(pedidos.id, id))

  revalidatePath('/admin/pedidos')
  revalidatePath('/admin')
}