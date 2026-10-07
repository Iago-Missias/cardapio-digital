'use client'

import { useState } from 'react'

type Item = {
  id: string
  nome: string
  precoAdicional: string | null
  padrao: boolean | null
}

type Grupo = {
  id: string
  nome: string
  tipo: string
  obrigatorio: boolean | null
  maxEscolhas: number | null
  itens: Item[]
}

type Produto = {
  id: string
  nome: string
  descricao: string | null
  preco: string
  imagemUrl: string | null
  ingredientesRemoviveis: string[]
  grupos: Grupo[]
}

type ItemCarrinho = {
  produtoId: string
  nome: string
  precoBase: number
  quantidade: number
  opcoes: { grupo: string; item: string; preco: number }[]
  removidos: string[]
  observacao: string
  precoTotal: number
}

export default function ModalProduto({
  produto,
  onFechar,
  onAdicionar,
}: {
  produto: Produto
  onFechar: () => void
  onAdicionar: (item: ItemCarrinho) => void
}) {
  const [quantidade, setQuantidade] = useState(1)
  const [observacao, setObservacao] = useState('')

  // escolhas: { [grupoId]: [itemId, itemId] }
  const [escolhas, setEscolhas] = useState<Record<string, string[]>>(() => {
    const inicial: Record<string, string[]> = {}
    produto.grupos.forEach((g) => {
      const padrao = g.itens.find((i) => i.padrao)
      inicial[g.id] = padrao ? [padrao.id] : []
    })
    return inicial
  })

  const [removidos, setRemovidos] = useState<string[]>([])

  function toggleItem(grupo: Grupo, itemId: string) {
    setEscolhas((prev) => {
      const atual = prev[grupo.id] ?? []
      const max = grupo.maxEscolhas ?? 1

      if (grupo.tipo === 'unica') {
        return { ...prev, [grupo.id]: [itemId] }
      }

      // múltipla
      if (atual.includes(itemId)) {
        return { ...prev, [grupo.id]: atual.filter((i) => i !== itemId) }
      }
      if (atual.length >= max) return prev
      return { ...prev, [grupo.id]: [...atual, itemId] }
    })
  }

  function toggleRemovido(nome: string) {
    setRemovidos((prev) =>
      prev.includes(nome) ? prev.filter((i) => i !== nome) : [...prev, nome]
    )
  }

  // ---- valida obrigatórios ----
  const faltandoObrigatorio = produto.grupos.some(
    (g) => g.obrigatorio && (escolhas[g.id]?.length ?? 0) === 0
  )

  // ---- calcula total ----
  const precoBase = Number(produto.preco)
  let adicionais = 0
  const opcoesFormatadas: ItemCarrinho['opcoes'] = []

  produto.grupos.forEach((g) => {
    const ids = escolhas[g.id] ?? []
    ids.forEach((id) => {
      const item = g.itens.find((i) => i.id === id)
      if (item) {
        const preco = Number(item.precoAdicional ?? 0)
        adicionais += preco
        opcoesFormatadas.push({ grupo: g.nome, item: item.nome, preco })
      }
    })
  })

  const precoUnitario = precoBase + adicionais
  const precoTotal = precoUnitario * quantidade

  function confirmar() {
    if (faltandoObrigatorio) return
    onAdicionar({
      produtoId: produto.id,
      nome: produto.nome,
      precoBase,
      quantidade,
      opcoes: opcoesFormatadas,
      removidos,
      observacao,
      precoTotal,
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center"
      onClick={onFechar}
    >
      <div
        className="bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="font-bold text-lg">{produto.nome}</h2>
          <button
            onClick={onFechar}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* imagem */}
        {produto.imagemUrl && (
          <img
            src={produto.imagemUrl}
            alt={produto.nome}
            className="w-full h-40 object-cover"
          />
        )}

        <div className="p-4 space-y-5">
          {/* descrição */}
          {produto.descricao && (
            <p className="text-sm text-gray-600">{produto.descricao}</p>
          )}

          {/* grupos */}
          {produto.grupos.map((g) => (
            <div key={g.id}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">
                  {g.nome}
                  {g.obrigatorio && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </h3>
                <span className="text-xs text-gray-500">
                  {g.tipo === 'unica'
                    ? 'Escolha 1'
                    : `Até ${g.maxEscolhas}`}
                </span>
              </div>

              <div className="space-y-1">
                {g.itens.map((it) => {
                  const marcado = escolhas[g.id]?.includes(it.id)
                  const precoAd = Number(it.precoAdicional ?? 0)
                  return (
                    <label
                      key={it.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
                        marcado ? 'bg-red-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type={g.tipo === 'unica' ? 'radio' : 'checkbox'}
                        name={g.id}
                        checked={marcado}
                        onChange={() => toggleItem(g, it.id)}
                        className="accent-red-600"
                      />
                      <span className="flex-1 text-sm">{it.nome}</span>
                      {precoAd > 0 && (
                        <span className="text-sm text-gray-500">
                          + R$ {precoAd.toFixed(2)}
                        </span>
                      )}
                    </label>
                  )
                })}
              </div>
            </div>
          ))}

          {/* ingredientes removíveis */}
          {produto.ingredientesRemoviveis.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Remover ingredientes
              </h3>
              <div className="flex flex-wrap gap-2">
                {produto.ingredientesRemoviveis.map((ing) => {
                  const marcado = removidos.includes(ing)
                  return (
                    <button
                      key={ing}
                      type="button"
                      onClick={() => toggleRemovido(ing)}
                      className={`text-sm px-3 py-1 rounded-full border ${
                        marcado
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      {marcado ? `Sem ${ing}` : ing}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* observação */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Observação</h3>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={2}
              placeholder="Ex: ponto da carne bem passado"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        {/* footer fixo */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex items-center gap-3">
          <div className="flex items-center gap-2 border rounded-lg">
            <button
              onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
              className="px-3 py-2 text-lg"
            >
              −
            </button>
            <span className="w-6 text-center font-semibold">{quantidade}</span>
            <button
              onClick={() => setQuantidade(quantidade + 1)}
              className="px-3 py-2 text-lg"
            >
              +
            </button>
          </div>

          <button
            onClick={confirmar}
            disabled={faltandoObrigatorio}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700"
          >
            {faltandoObrigatorio
              ? 'Escolha as opções obrigatórias'
              : `Adicionar • R$ ${precoTotal.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  )
}
