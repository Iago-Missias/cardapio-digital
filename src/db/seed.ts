import { db } from './index'
import {
  restaurantes, categorias, produtos, opcoesGrupos, opcoesItens
} from './schema'

async function seed() {
  console.log('🌱 Semeando banco...')

  await db.delete(opcoesItens)
  await db.delete(opcoesGrupos)
  await db.delete(produtos)
  await db.delete(categorias)
  await db.delete(restaurantes)

  const [rest] = await db.insert(restaurantes).values({
    slug: 'lanchonete-do-ze',
    nome: 'Lanchonete do Zé',
    whatsapp: '5511999999999',
    corPrimaria: '#c0392b',
    endereco: 'Rua das Flores, 123 — Centro',
    tempoMedioMin: 20,
  }).returning()

  const [lanches] = await db.insert(categorias).values({
    restauranteId: rest.id, nome: 'Lanches', ordem: 1,
  }).returning()

  const [marmitex] = await db.insert(categorias).values({
    restauranteId: rest.id, nome: 'Marmitex', ordem: 2,
  }).returning()

  const [bebidas] = await db.insert(categorias).values({
    restauranteId: rest.id, nome: 'Bebidas', ordem: 3,
  }).returning()

  // ---------- LANCHES ----------
  await db.insert(produtos).values([
    {
      categoriaId: lanches.id,
      nome: 'X-Burger',
      descricao: 'Pão, carne, queijo e salada',
      preco: '18.00',
      ordem: 1,
      ingredientesRemoviveis: ['Cebola', 'Tomate', 'Alface', 'Picles'],
    },
    {
      categoriaId: lanches.id,
      nome: 'X-Bacon',
      descricao: 'Pão, carne, queijo, bacon e salada',
      preco: '22.00',
      ordem: 2,
      ingredientesRemoviveis: ['Cebola', 'Tomate', 'Alface', 'Picles'],
    },
  ])

  // ---------- MARMITEX ----------
  const [marmitexProd] = await db.insert(produtos).values({
    categoriaId: marmitex.id,
    nome: 'Marmitex Completa',
    descricao: 'Arroz, feijão, farofa, proteína e salada',
    preco: '25.00',
    ordem: 1,
    ingredientesRemoviveis: ['Cebola', 'Tomate', 'Salada'],
  }).returning()

  // ---- Grupo 1: Arroz ----
  const [gArroz] = await db.insert(opcoesGrupos).values({
    produtoId: marmitexProd.id,
    nome: 'Escolha o arroz',
    tipo: 'unica',
    obrigatorio: true,
    minEscolhas: 1,
    maxEscolhas: 1,
    ordem: 1,
  }).returning()

  await db.insert(opcoesItens).values([
    { grupoId: gArroz.id, nome: 'Arroz branco',  precoAdicional: '0.00', padrao: true, ordem: 1 },
    { grupoId: gArroz.id, nome: 'Arroz integral', precoAdicional: '0.00', ordem: 2 },
  ])

  // ---- Grupo 2: Feijão ----
  const [gFeijao] = await db.insert(opcoesGrupos).values({
    produtoId: marmitexProd.id,
    nome: 'Escolha o feijão',
    tipo: 'unica',
    obrigatorio: true,
    minEscolhas: 1,
    maxEscolhas: 1,
    ordem: 2,
  }).returning()

  await db.insert(opcoesItens).values([
    { grupoId: gFeijao.id, nome: 'Feijão carioca', precoAdicional: '0.00', padrao: true, ordem: 1 },
    { grupoId: gFeijao.id, nome: 'Feijão preto',   precoAdicional: '0.00', ordem: 2 },
  ])

  // ---- Grupo 3: Farofa ----
  const [gFarofa] = await db.insert(opcoesGrupos).values({
    produtoId: marmitexProd.id,
    nome: 'Escolha a farofa',
    tipo: 'unica',
    obrigatorio: true,
    minEscolhas: 1,
    maxEscolhas: 1,
    ordem: 3,
  }).returning()

  await db.insert(opcoesItens).values([
    { grupoId: gFarofa.id, nome: 'Farofa simples',  precoAdicional: '0.00', padrao: true, ordem: 1 },
    { grupoId: gFarofa.id, nome: 'Farofa de bacon', precoAdicional: '0.00', ordem: 2 },
  ])

  // ---- Grupo 4: Adicionais ----
  const [gAdic] = await db.insert(opcoesGrupos).values({
    produtoId: marmitexProd.id,
    nome: 'Adicionais',
    tipo: 'multipla',
    obrigatorio: false,
    minEscolhas: 0,
    maxEscolhas: 3,
    ordem: 4,
  }).returning()

  await db.insert(opcoesItens).values([
    { grupoId: gAdic.id, nome: '+ Ovo',    precoAdicional: '2.00', ordem: 1 },
    { grupoId: gAdic.id, nome: '+ Bacon',  precoAdicional: '3.00', ordem: 2 },
    { grupoId: gAdic.id, nome: '+ Queijo', precoAdicional: '2.00', ordem: 3 },
  ])

  // ---------- BEBIDAS ----------
  await db.insert(produtos).values([
    { categoriaId: bebidas.id, nome: 'Coca-Cola Lata', descricao: '350ml gelada', preco: '6.00', ordem: 1 },
    { categoriaId: bebidas.id, nome: 'Suco de Laranja', descricao: '500ml natural', preco: '10.00', ordem: 2 },
  ])

  console.log('✅ Seed concluído!')
  process.exit(0)
}

seed().catch((e) => {
  console.error('❌ Erro:', e)
  process.exit(1)
})