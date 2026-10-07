import { db } from '@/db'
import { restaurantes } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import dynamicImport from 'next/dynamic'
import { estaAberto, type Horarios } from '@/lib/horarios'

const CheckoutClient = dynamicImport(() => import('../../components/CheckoutClient'))

export const dynamic = 'force-dynamic'

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const rest = await db.query.restaurantes.findFirst({
    where: eq(restaurantes.slug, slug),
  })

  if (!rest) notFound()

  const status = estaAberto((rest.horarios as Horarios | null) ?? null)

  return (
    <CheckoutClient
      restaurante={{
        slug: rest.slug,
        nome: rest.nome,
        logoUrl: rest.logoUrl,
        corPrimaria: rest.corPrimaria ?? '#c0392b',
        endereco: rest.endereco,
        whatsapp: rest.whatsapp,
        tempoMedioMin: rest.tempoMedioMin ?? 20,
      }}
      status={status}
    />
  )
}
