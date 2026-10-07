// src/app/admin/pedidos/[id]/imprimir/page.tsx
import { db } from '@/db'
import { pedidos, restaurantes } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { writeFile } from 'fs/promises'

const LARGURA = 32

export default async function ImprimirPedidoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Busca o pedido
  const pedido = await db.query.pedidos.findFirst({
    where: eq(pedidos.id, id),
  })

  if (!pedido) {
    notFound()
  }

  // ✅ CORREÇÃO: verifica se restauranteId existe antes de usar no eq()
  if (!pedido.restauranteId) {
    notFound()
  }

  const rest = await db.query.restaurantes.findFirst({
    where: eq(restaurantes.id, pedido.restauranteId),
  })

  if (!rest) {
    notFound()
  }

  // ... resto do seu código de impressão
  return (
    <div>
      {/* conteúdo da página */}
    </div>
  )
}