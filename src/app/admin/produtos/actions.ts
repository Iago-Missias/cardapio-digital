'use server'

import { db } from '@/db'
import { produtos, opcoesGrupos, opcoesItens } from '@/db/schema'
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'

function extrairDias(formData: FormData): number[] {
  return formData
    .getAll('diasSemana')
    .map((v) => parseInt(v as string, 10))
    .filter((n) => !isNaN(n))
}

export async function criarProduto(formData: FormData): Promise<string> {
  const nome = formData.get('nome') as string
  const descricao = formData.get('descricao') as string
  const preco = formData.get('preco') as string
  const imagemUrl = formData.get('imagemUrl') as string
  const categoriaId = formData.get('categoriaId') as string

  if (!nome || !preco || !categoriaId) {
    throw new Error('Campos obrigatórios: nome, preço, categoria')
  }

  const [criado] = await db.insert(produtos).values({
    nome,
    descricao: descricao || null,
    preco,
    imagemUrl: imagemUrl || null,
    categoriaId,
    disponivel: true,
    diasSemana: extrairDias(formData),
  }).returning({ id: produtos.id })

  revalidatePath('/admin/produtos')
  revalidatePath('/menu')
  return criado.id
}

export async function atualizarProduto(id: string, formData: FormData) {
  const nome = formData.get('nome') as string
  const descricao = formData.get('descricao') as string
  const preco = formData.get('preco') as string
  const imagemUrl = formData.get('imagemUrl') as string
  const categoriaId = formData.get('categoriaId') as string

  await db.update(produtos).set({
    nome,
    descricao: descricao || null,
    preco,
    imagemUrl: imagemUrl || null,
    categoriaId,
    diasSemana: extrairDias(formData),
  }).where(eq(produtos.id, id))

  revalidatePath(`/admin/produtos/${id}`)
  revalidatePath('/admin/produtos')
  revalidatePath('/menu')
}

export async function alternarDisponibilidade(id: string, disponivel: boolean) {
  await db.update(produtos).set({ disponivel }).where(eq(produtos.id, id))
  revalidatePath('/admin/produtos')
  revalidatePath('/menu')
}

export async function excluirProduto(id: string) {
  await db.delete(produtos).where(eq(produtos.id, id))
  revalidatePath('/admin/produtos')
  revalidatePath('/menu')
}

export async function atualizarIngredientesRemoviveis(
  produtoId: string,
  ingredientes: string[]
) {
  await db.update(produtos)
    .set({ ingredientesRemoviveis: ingredientes })
    .where(eq(produtos.id, produtoId))

  revalidatePath(`/admin/produtos/${produtoId}`)
}

export async function criarGrupo(produtoId: string, formData: FormData) {
  const nome = formData.get('nome') as string
  const tipo = formData.get('tipo') as string
  const obrigatorio = formData.get('obrigatorio') === 'on'
  const maxEscolhas = parseInt(formData.get('maxEscolhas') as string) || 1

  if (!nome || !tipo) throw new Error('Nome e tipo são obrigatórios')

  const existentes = await db.select().from(opcoesGrupos)
    .where(eq(opcoesGrupos.produtoId, produtoId))

  await db.insert(opcoesGrupos).values({
    produtoId,
    nome,
    tipo,
    obrigatorio,
    minEscolhas: obrigatorio ? 1 : 0,
    maxEscolhas,
    ordem: existentes.length + 1,
  })

  revalidatePath(`/admin/produtos/${produtoId}`)
}

export async function excluirGrupo(grupoId: string) {
  await db.delete(opcoesGrupos).where(eq(opcoesGrupos.id, grupoId))
  revalidatePath('/admin/produtos')
}

export async function criarItem(grupoId: string, formData: FormData) {
  const nome = formData.get('nome') as string
  const precoAdicional = formData.get('precoAdicional') as string
  const padrao = formData.get('padrao') === 'on'

  if (!nome) throw new Error('Nome obrigatório')

  const existentes = await db.select().from(opcoesItens)
    .where(eq(opcoesItens.grupoId, grupoId))

  await db.insert(opcoesItens).values({
    grupoId,
    nome,
    precoAdicional: precoAdicional || '0.00',
    padrao,
    ordem: existentes.length + 1,
  })

  revalidatePath('/admin/produtos')
}

export async function excluirItem(itemId: string) {
  await db.delete(opcoesItens).where(eq(opcoesItens.id, itemId))
  revalidatePath('/admin/produtos')
}
