'use client'

import { useState, useTransition } from 'react'
import { atualizarIngredientesRemoviveis } from '../actions'

export default function GerenciadorIngredientes({
  produtoId,
  ingredientes,
}: {
  produtoId: string
  ingredientes: string[]
}) {
  const [lista, setLista] = useState<string[]>(ingredientes)
  const [novo, setNovo] = useState('')
  const [, startTransition] = useTransition()

  function adicionar() {
    const limpo = novo.trim()
    if (!limpo || lista.includes(limpo)) return
    const novaLista = [...lista, limpo]
    setLista(novaLista)
    setNovo('')
    startTransition(() => {
      atualizarIngredientesRemoviveis(produtoId, novaLista)
    })
  }

  function remover(item: string) {
    const novaLista = lista.filter((i) => i !== item)
    setLista(novaLista)
    startTransition(() => {
      atualizarIngredientesRemoviveis(produtoId, novaLista)
    })
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
      <div>
        <h2 className="font-semibold text-gray-700">Ingredientes removíveis</h2>
        <p className="text-xs text-gray-500 mt-1">
          Itens que o cliente pode pedir para retirar do prato.
        </p>
      </div>

      {lista.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {lista.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm"
            >
              {item}
              <button
                onClick={() => remover(item)}
                className="text-gray-500 hover:text-red-600"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), adicionar())}
          placeholder="Ex: Cebola"
          className="flex-1 px-3 py-2 border rounded-lg"
        />
        <button
          onClick={adicionar}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-900"
        >
          + Adicionar
        </button>
      </div>
    </div>
  )
}
