'use client'

import { useState } from 'react'
import { criarGrupo, excluirGrupo, criarItem, excluirItem } from '../actions'

type Item = {
  id: string
  nome: string
  precoAdicional: string | null
  padrao: boolean | null
  ordem: number | null
}

type Grupo = {
  id: string
  nome: string
  tipo: string
  obrigatorio: boolean | null
  minEscolhas: number | null
  maxEscolhas: number | null
  ordem: number | null
  itens: Item[]
}

export default function GerenciadorOpcoes({
  produtoId,
  grupos,
}: {
  produtoId: string
  grupos: Grupo[]
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-700">Acompanhamentos e Opções</h2>
        <span className="text-xs text-gray-500">Ex: &quot;Escolha o arroz&quot;</span>
      </div>

      {grupos.length === 0 && (
        <p className="text-sm text-gray-400 italic">
          Nenhum grupo criado. Adicione o primeiro abaixo.
        </p>
      )}

      {grupos.map((g) => (
        <GrupoCard key={g.id} grupo={g} />
      ))}

      <NovoGrupoForm produtoId={produtoId} />
    </div>
  )
}

function GrupoCard({ grupo }: { grupo: Grupo }) {
  const [aberto, setAberto] = useState(true)

  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="bg-gray-50 p-3 flex items-center gap-3">
        <button onClick={() => setAberto(!aberto)} className="text-gray-500 hover:text-gray-800">
          {aberto ? '▾' : '▸'}
        </button>
        <div className="flex-1">
          <p className="font-semibold">{grupo.nome}</p>
          <p className="text-xs text-gray-500">
            {grupo.tipo === 'unica' ? 'Escolha única' : 'Múltipla escolha'}
            {grupo.obrigatorio && ' • Obrigatório'}
          </p>
        </div>
        <form action={() => excluirGrupo(grupo.id)}>
          <button type="submit" className="text-xs text-red-600 hover:underline">
            Excluir grupo
          </button>
        </form>
      </div>

      {aberto && (
        <div className="p-3 space-y-2">
          {grupo.itens.map((it) => (
            <div key={it.id} className="flex items-center gap-3 text-sm py-1">
              <span className="flex-1">{it.nome}</span>
              <span className="text-gray-500">
                + R$ {Number(it.precoAdicional ?? 0).toFixed(2)}
              </span>
              {it.padrao && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  padrão
                </span>
              )}
              <form action={() => excluirItem(it.id)}>
                <button type="submit" className="text-xs text-red-600 hover:underline">
                  remover
                </button>
              </form>
            </div>
          ))}
          <NovoItemForm grupoId={grupo.id} />
        </div>
      )}
    </div>
  )
}

function NovoItemForm({ grupoId }: { grupoId: string }) {
  const [aberto, setAberto] = useState(false)

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="text-xs text-blue-600 hover:underline mt-1"
      >
        + Adicionar item
      </button>
    )
  }

  return (
    <form
      action={async (fd) => {
        await criarItem(grupoId, fd)
        setAberto(false)
      }}
      className="flex flex-wrap gap-2 items-end bg-blue-50 p-2 rounded-lg mt-2"
    >
      <label className="flex-1 min-w-[120px]">
        <span className="text-xs text-gray-600">Nome</span>
        <input
          name="nome"
          required
          placeholder="Ex: Branco"
          className="w-full px-2 py-1 border rounded text-sm"
        />
      </label>
      <label className="w-24">
        <span className="text-xs text-gray-600">+ R$</span>
        <input
          name="precoAdicional"
          type="number"
          step="0.01"
          defaultValue="0.00"
          className="w-full px-2 py-1 border rounded text-sm"
        />
      </label>
      <label className="flex items-center gap-1 text-xs pb-2">
        <input type="checkbox" name="padrao" /> padrão
      </label>
      <button
        type="submit"
        className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-700"
      >
        Adicionar
      </button>
      <button
        type="button"
        onClick={() => setAberto(false)}
        className="text-xs text-gray-500"
      >
        cancelar
      </button>
    </form>
  )
}

function NovoGrupoForm({ produtoId }: { produtoId: string }) {
  const [aberto, setAberto] = useState(false)

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="w-full border-2 border-dashed border-gray-300 text-gray-500 rounded-xl py-3 text-sm hover:border-gray-400 hover:text-gray-700"
      >
        + Adicionar grupo de opções (ex: &quot;Escolha o arroz&quot;)
      </button>
    )
  }

  return (
    <form
      action={async (fd) => {
        await criarGrupo(produtoId, fd)
        setAberto(false)
      }}
      className="border rounded-xl p-4 bg-gray-50 space-y-3"
    >
      <label className="block">
        <span className="text-sm text-gray-700">Nome do grupo *</span>
        <input
          name="nome"
          required
          placeholder="Ex: Escolha o arroz"
          className="mt-1 w-full px-3 py-2 border rounded-lg"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm text-gray-700">Tipo *</span>
          <select name="tipo" required className="mt-1 w-full px-3 py-2 border rounded-lg">
            <option value="unica">Escolha única (rádio)</option>
            <option value="multipla">Múltipla escolha (checkbox)</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-gray-700">Máximo de escolhas</span>
          <input
            name="maxEscolhas"
            type="number"
            defaultValue={1}
            min={1}
            className="mt-1 w-full px-3 py-2 border rounded-lg"
          />
        </label>
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="obrigatorio" />
        <span className="text-sm text-gray-700">Cliente é obrigado a escolher</span>
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
        >
          Criar grupo
        </button>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="px-4 py-2 rounded-lg border"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
