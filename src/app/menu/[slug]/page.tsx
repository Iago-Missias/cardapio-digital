import { db } from '@/db'
import {
  restaurantes, categorias, produtos, opcoesGrupos, opcoesItens
} from '@/db/schema'
import { asc, eq, inArray } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import dynamicImport from 'next/dynamic'
import { estaAberto, type Horarios } from '@/lib/horarios'

const MenuClient = dynamicImport(() => import('../components/MenuClient'))

export const dynamic = 'force-dynamic'

export default async function MenuPage({
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

  const cats = await db.select().from(categorias)
    .where(eq(categorias.restauranteId, rest.id))
    .orderBy(asc(categorias.ordem))

  const prods = await db.select().from(produtos).orderBy(asc(produtos.ordem))

  const hoje = new Date().getDay()

  const produtosDisponiveis = prods.filter((p) => {
    if (!p.disponivel) return false
    const dias = p.diasSemana ?? []
    if (dias.length === 0) return true
    return dias.includes(hoje)
  })

  const prodIds = produtosDisponiveis.map((p) => p.id)

  const grupos = prodIds.length
    ? await db.select().from(opcoesGrupos)
        .where(inArray(opcoesGrupos.produtoId, prodIds))
        .orderBy(asc(opcoesGrupos.ordem))
    : []

  const grupoIds = grupos.map((g) => g.id)
  const itens = grupoIds.length
    ? await db.select().from(opcoesItens)
        .where(inArray(opcoesItens.grupoId, grupoIds))
        .orderBy(asc(opcoesItens.ordem))
    : []

  const produtosCompletos = produtosDisponiveis.map((p) => ({
    id: p.id,
    nome: p.nome,
    descricao: p.descricao,
    preco: p.preco,
    imagemUrl: p.imagemUrl,
    disponivel: p.disponivel,
    categoriaId: p.categoriaId,
    ingredientesRemoviveis: p.ingredientesRemoviveis ?? [],
    grupos: grupos
      .filter((g) => g.produtoId === p.id)
      .map((g) => ({
        id: g.id,
        nome: g.nome,
        tipo: g.tipo,
        obrigatorio: g.obrigatorio ?? false,
        minEscolhas: g.minEscolhas ?? 0,
        maxEscolhas: g.maxEscolhas ?? 1,
        itens: itens.filter((i) => i.grupoId === g.id),
      })),
  }))

  const categoriasComProdutos = cats
    .map((c) => ({
      id: c.id,
      nome: c.nome,
      produtos: produtosCompletos.filter((p) => p.categoriaId === c.id),
    }))
    .filter((c) => c.produtos.length > 0)

  return (
    <MenuClient
      restaurante={{
        slug: rest.slug,
        nome: rest.nome,
        logoUrl: rest.logoUrl,
        corPrimaria: rest.corPrimaria ?? '#c0392b',
        endereco: rest.endereco,
        tempoMedioMin: rest.tempoMedioMin ?? 20,
      }}
      categorias={categoriasComProdutos}
      status={status}
      whatsapp={rest.whatsapp}
      horarios={(rest.horarios as Horarios | null) ?? null}
    />
  )
}
