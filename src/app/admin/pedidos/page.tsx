import { db } from '@/db'
import { pedidos } from '@/db/schema'
import { gte, sql } from 'drizzle-orm'
import dynamicImport from 'next/dynamic'

const PedidosClient = dynamicImport(() => import('../components/PedidosClient'))

export const dynamic = 'force-dynamic'

export default async function PedidosPage() {
  const hoje = new Date()
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())

  const lista = await db
    .select()
    .from(pedidos)
    .where(gte(pedidos.criadoEm, inicio))
    .orderBy(sql`${pedidos.criadoEm} DESC`)

  return <PedidosClient pedidosIniciais={lista as any[]} />
}
