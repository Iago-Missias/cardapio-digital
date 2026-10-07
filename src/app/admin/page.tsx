import { db } from '@/db'
import { pedidos } from '@/db/schema'
import { gte, sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export default async function AdminHome() {
  const hoje = new Date()
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())

  // Conta pedidos de hoje e soma o total
  const resultado = await db.execute(sql`
    select
      count(*)::int as quantidade,
      coalesce(sum(total), 0)::numeric as faturamento
    from pedidos
    where criado_em >= ${inicio.toISOString()}
      and status != 'cancelado'
  `)

  const quantidade = Number((resultado[0] as any)?.quantidade ?? 0)
  const faturamento = Number((resultado[0] as any)?.faturamento ?? 0)
  const ticketMedio = quantidade > 0 ? faturamento / quantidade : 0

  const formatarReal = (valor: number) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Pedidos hoje</p>
          <p className="text-3xl font-bold mt-1">{quantidade}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Faturamento hoje</p>
          <p className="text-3xl font-bold mt-1 text-green-600">
            {formatarReal(faturamento)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Ticket médio</p>
          <p className="text-3xl font-bold mt-1">{formatarReal(ticketMedio)}</p>
        </div>
      </div>
    </div>
  )
}