import { db } from '@/db'
import { categorias } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { criarProduto } from '../actions'
import { redirect } from 'next/navigation'
import UploadImagem from '../components/UploadImagem'

export default async function NovoProdutoPage() {
  const restaurante = await db.query.restaurantes.findFirst()
  if (!restaurante) redirect('/admin/produtos')

  const cats = await db
    .select()
    .from(categorias)
    .where(eq(categorias.restauranteId, restaurante.id))
    .orderBy(asc(categorias.ordem))

  async function submit(formData: FormData) {
    'use server'
    const id = await criarProduto(formData)
    redirect(`/admin/produtos/${id}`)
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Novo Produto</h1>

      <form action={submit} className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
        <label className="block">
          <span className="text-sm text-gray-700">Nome *</span>
          <input name="nome" required className="mt-1 w-full px-3 py-2 border rounded-lg" />
        </label>

        <label className="block">
          <span className="text-sm text-gray-700">Descrição</span>
          <textarea name="descricao" rows={2} className="mt-1 w-full px-3 py-2 border rounded-lg" />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-gray-700">Preço (R$) *</span>
            <input name="preco" type="number" step="0.01" required
              className="mt-1 w-full px-3 py-2 border rounded-lg" />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Categoria *</span>
            <select name="categoriaId" required className="mt-1 w-full px-3 py-2 border rounded-lg">
              <option value="">Selecione...</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <span className="text-sm text-gray-700 block mb-2">Foto do prato</span>
          <UploadImagem name="imagemUrl" />
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
                <input type="checkbox" name="diasSemana" value={d.v} />
                {d.l}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex gap-3 pt-2">
          <button type="submit"
            className="bg-red-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-700">
            Salvar e adicionar opções
          </button>
          <a href="/admin/produtos" className="px-5 py-2 rounded-lg border hover:bg-gray-50">
            Cancelar
          </a>
        </div>
      </form>
    </div>
  )
}
