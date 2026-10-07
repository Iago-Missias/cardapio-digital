import { db } from '@/db'
import { produtos, categorias, opcoesGrupos, opcoesItens } from '@/db/schema'
import { asc, eq } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { atualizarProduto } from '../actions'
import dynamicImport from 'next/dynamic'
import UploadImagem from '../components/UploadImagem'

const GerenciadorOpcoes = dynamicImport(() => import('../components/GerenciadorOpcoes'))
const GerenciadorIngredientes = dynamicImport(() => import('../components/GerenciadorIngredientes'))

export const dynamic = 'force-dynamic'

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const prod = await db.query.produtos.findFirst({
    where: eq(produtos.id, id),
  })

  if (!prod) notFound()

  // ✅ FIX 1: captura o id AQUI, fora da server action
  const produtoId = prod.id

  const rest = await db.query.restaurantes.findFirst()
  const cats = rest
    ? await db.select().from(categorias)
        .where(eq(categorias.restauranteId, rest.id))
        .orderBy(asc(categorias.ordem))
    : []

  const grupos = await db.select().from(opcoesGrupos)
    .where(eq(opcoesGrupos.produtoId, prod.id))
    .orderBy(asc(opcoesGrupos.ordem))

  const gruposComItens = await Promise.all(
    grupos.map(async (g) => {
      const itens = await db.select().from(opcoesItens)
        .where(eq(opcoesItens.grupoId, g.id))
        .orderBy(asc(opcoesItens.ordem))
      return { ...g, itens }
    })
  )

  // ✅ FIX 1 (continuação): usa produtoId, não prod.id
  async function salvarDadosBasicos(formData: FormData) {
    'use server'
    await atualizarProduto(produtoId, formData)
    redirect('/admin/produtos')
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/produtos" className="text-sm text-gray-500 hover:text-gray-800">
          ← Voltar
        </Link>
        <h1 className="text-2xl font-bold">Editar Produto</h1>
      </div>

      <form action={salvarDadosBasicos} className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
        <h2 className="font-semibold text-gray-700">Dados básicos</h2>

        <label className="block">
          <span className="text-sm text-gray-700">Nome *</span>
          <input name="nome" defaultValue={prod.nome} required
            className="mt-1 w-full px-3 py-2 border rounded-lg" />
        </label>

        <label className="block">
          <span className="text-sm text-gray-700">Descrição</span>
          <textarea name="descricao" defaultValue={prod.descricao ?? ''} rows={2}
            className="mt-1 w-full px-3 py-2 border rounded-lg" />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-gray-700">Preço (R$) *</span>
            <input name="preco" type="number" step="0.01"
              defaultValue={Number(prod.preco).toFixed(2)} required
              className="mt-1 w-full px-3 py-2 border rounded-lg" />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Categoria *</span>
            {/* ✅ FIX 2: ?? '' para aceitar null */}
            <select name="categoriaId" defaultValue={prod.categoriaId ?? ''} required
              className="mt-1 w-full px-3 py-2 border rounded-lg">
              {cats.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <span className="text-sm text-gray-700 block mb-2">Foto do prato</span>
          <UploadImagem name="imagemUrl" valorInicial={prod.imagemUrl ?? ''} />
        </div>

        <fieldset className="border-t pt-4">
          <legend className="text-sm text-gray-700 font-medium mb-2">
            Dias da semana (vazio = todos os dias)
          </legend>
          <div className="flex flex-wrap gap-3">
            {[
              { v: 0, l: 'Dom' }, { v: 1, l: 'Seg' }, { v: 2, l: 'Ter' },
              { v: 3, l: 'Qua' }, { v: 4, l: 'Qui' }, { v: 5, l: 'Sex' },
              { v: 6, l: 'Sáb' },
            ].map((d) => (
              <label key={d.v} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  name="diasSemana"
                  value={d.v}
                  defaultChecked={(prod.diasSemana ?? []).includes(d.v)}
                />
                {d.l}
              </label>
            ))}
          </div>
        </fieldset>

        <button type="submit"
          className="bg-red-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-700">
          Salvar dados básicos
        </button>
      </form>

      <GerenciadorOpcoes produtoId={prod.id} grupos={gruposComItens} />

      <GerenciadorIngredientes produtoId={prod.id}
        ingredientes={prod.ingredientesRemoviveis ?? []} />
    </div>
  )
}