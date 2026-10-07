import { db } from '@/db'
import { produtos, categorias } from '@/db/schema'
import { asc, eq } from 'drizzle-orm'
import Link from 'next/link'
import { alternarDisponibilidade, excluirProduto } from './actions'

export const dynamic = 'force-dynamic'

export default async function ProdutosPage() {
  const restaurante = await db.query.restaurantes.findFirst()

  if (!restaurante) {
    return <p className="text-gray-500">Nenhum restaurante. Rode npm run db:seed.</p>
  }

  const cats = await db
    .select()
    .from(categorias)
    .where(eq(categorias.restauranteId, restaurante.id))
    .orderBy(asc(categorias.ordem))

  const prods = await db.select().from(produtos).orderBy(asc(produtos.ordem))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Link
          href="/admin/produtos/novo"
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700"
        >
          + Novo Produto
        </Link>
      </div>

      {cats.map((cat) => {
        const doGrupo = prods.filter((p) => p.categoriaId === cat.id)
        return (
          <section key={cat.id} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">{cat.nome}</h2>

            {doGrupo.length === 0 && (
              <p className="text-sm text-gray-400 italic">Nenhum produto nesta categoria</p>
            )}

            <div className="space-y-2">
              {doGrupo.map((p) => (
                <div
                  key={p.id}
                  className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4"
                >
                  {p.imagemUrl && (
                    <img
                      src={p.imagemUrl}
                      alt={p.nome}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{p.nome}</p>
                    <p className="text-sm text-gray-500">{p.descricao}</p>
                  </div>
                  <span className="font-bold text-green-600">
                    R$ {Number(p.preco).toFixed(2)}
                  </span>

                  <Link
                    href={`/admin/produtos/${p.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Editar
                  </Link>

                  <form action={async () => {
                    'use server'
                    await alternarDisponibilidade(p.id, !p.disponivel)
                  }}>
                    <button
                      className={`text-xs px-3 py-1 rounded-full ${
                        p.disponivel
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {p.disponivel ? 'Ativo' : 'Pausado'}
                    </button>
                  </form>

                  <form action={async () => {
                    'use server'
                    await excluirProduto(p.id)
                  }}>
                    <button className="text-sm text-red-600 hover:underline">
                      Excluir
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
