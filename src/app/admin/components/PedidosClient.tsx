'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { atualizarStatus, type StatusPedido } from '@/app/admin/pedidos/actions'

type Pedido = {
  id: string
  codigo: string
  clienteNome: string
  clienteWhatsapp: string
  itens: any[]
  subtotal: string
  total: string
  status: string
  criadoEm: string
  observacao: string | null
}

const STATUS_INFO: Record<string, { label: string; cor: string; emoji: string }> = {
  aguardando_pagamento: { label: 'Aguardando pagto', cor: 'bg-amber-100 text-amber-800 border-amber-300', emoji: '⏳' },
  pago: { label: 'Pago', cor: 'bg-green-100 text-green-800 border-green-300', emoji: '💰' },
  em_preparo: { label: 'Em preparo', cor: 'bg-blue-100 text-blue-800 border-blue-300', emoji: '👨‍🍳' },
  pronto: { label: 'Pronto', cor: 'bg-emerald-100 text-emerald-800 border-emerald-300', emoji: '✅' },
  retirado: { label: 'Retirado', cor: 'bg-gray-100 text-gray-600 border-gray-300', emoji: '🤝' },
  cancelado: { label: 'Cancelado', cor: 'bg-red-100 text-red-800 border-red-300', emoji: '❌' },
}

export default function PedidosClient({ pedidosIniciais }: { pedidosIniciais: Pedido[] }) {
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>(pedidosIniciais)
  const [filtro, setFiltro] = useState<string>('ativos')
  const [expandido, setExpandido] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  // Polling a cada 5s
  useEffect(() => {
    const t = setInterval(() => router.refresh(), 5000)
    return () => clearInterval(t)
  }, [router])

  // Sincroniza quando o servidor atualiza
  useEffect(() => {
    setPedidos(pedidosIniciais)
  }, [pedidosIniciais])

  function mudarStatus(id: string, status: StatusPedido) {
    startTransition(async () => {
      await atualizarStatus(id, status)
      router.refresh()
    })
  }

  const filtrados = pedidos.filter((p) => {
    if (filtro === 'ativos') return ['aguardando_pagamento', 'pago', 'em_preparo', 'pronto'].includes(p.status)
    if (filtro === 'todos') return true
    return p.status === filtro
  })

  const totais = {
    aguardando: pedidos.filter((p) => p.status === 'aguardando_pagamento').length,
    preparo: pedidos.filter((p) => ['pago', 'em_preparo'].includes(p.status)).length,
    prontos: pedidos.filter((p) => p.status === 'pronto').length,
  }

  return (
    <div>
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-amber-400">
          <p className="text-xs text-gray-500">Aguardando pagto</p>
          <p className="text-2xl font-bold mt-1">{totais.aguardando}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-400">
          <p className="text-xs text-gray-500">Em preparo / pagos</p>
          <p className="text-2xl font-bold mt-1">{totais.preparo}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-emerald-400">
          <p className="text-xs text-gray-500">Prontos pra retirar</p>
          <p className="text-2xl font-bold mt-1">{totais.prontos}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { v: 'ativos', l: 'Ativos' },
          { v: 'aguardando_pagamento', l: '⏳ Aguardando' },
          { v: 'pago', l: '💰 Pagos' },
          { v: 'em_preparo', l: '👨‍🍳 Em preparo' },
          { v: 'pronto', l: '✅ Prontos' },
          { v: 'retirado', l: '🤝 Retirados' },
          { v: 'todos', l: 'Todos' },
        ].map((f) => (
          <button
            key={f.v}
            onClick={() => setFiltro(f.v)}
            className={`text-sm px-3 py-1.5 rounded-full border transition ${
              filtro === f.v
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>

      {filtrados.length === 0 && (
        <div className="bg-white p-12 rounded-xl shadow-sm text-center">
          <p className="text-gray-400 text-lg">Nenhum pedido</p>
          <p className="text-sm text-gray-400 mt-1">
            Os pedidos aparecem aqui em tempo real
          </p>
        </div>
      )}

      <div className="space-y-3">
        {filtrados.map((p) => {
          const info = STATUS_INFO[p.status] ?? STATUS_INFO.aguardando_pagamento
          const aberto = expandido === p.id
          const hora = new Date(p.criadoEm).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })

          return (
            <div key={p.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div
                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandido(aberto ? null : p.id)}
              >
                <div className="text-center flex-shrink-0">
                  <p className="text-2xl font-bold font-mono text-gray-900">
                    {p.codigo}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{hora}</p>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {p.clienteNome}
                  </p>
                  <p className="text-xs text-gray-500">
                    {p.itens?.length ?? 0}{' '}
                    {(p.itens?.length ?? 0) === 1 ? 'item' : 'itens'} • R${' '}
                    {Number(p.total).toFixed(2)}
                  </p>
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full border font-medium ${info.cor}`}
                >
                  {info.emoji} {info.label}
                </span>

                <span className="text-gray-400 text-lg">
                  {aberto ? '▾' : '▸'}
                </span>
              </div>

              {aberto && (
                <div className="border-t p-4 bg-gray-50 space-y-4">
                  {/* Itens */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                      Itens do pedido
                    </p>
                    <ul className="space-y-2">
                      {p.itens?.map((item: any, i: number) => (
                        <li key={i} className="text-sm bg-white p-3 rounded-lg">
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {item.quantidade}x {item.nome}
                            </span>
                            <span>R$ {Number(item.precoTotal).toFixed(2)}</span>
                          </div>
                          {item.opcoes?.map((o: any, j: number) => (
                            <p key={j} className="text-xs text-gray-500 ml-4">
                              {o.grupo}: {o.item}
                            </p>
                          ))}
                          {item.removidos?.length > 0 && (
                            <p className="text-xs text-red-500 ml-4">
                              Sem: {item.removidos.join(', ')}
                            </p>
                          )}
                          {item.observacao && (
                            <p className="text-xs text-gray-400 italic ml-4">
                              Obs: {item.observacao}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cliente */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                      Cliente
                    </p>
                    <p className="text-sm">
                      <strong>{p.clienteNome}</strong> ·{' '}
                      <a
                        href={`https://wa.me/55${p.clienteWhatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        WhatsApp
                      </a>
                    </p>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {p.status === 'aguardando_pagamento' && (
                      <button
                        onClick={() => mudarStatus(p.id, 'pago')}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg font-medium"
                      >
                        ✅ Confirmar pagamento
                      </button>
                    )}
                    {p.status === 'pago' && (
                      <button
                        onClick={() => mudarStatus(p.id, 'em_preparo')}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium"
                      >
                        👨‍🍳 Iniciar preparo
                      </button>
                    )}
                    {p.status === 'em_preparo' && (
                      <button
                        onClick={() => mudarStatus(p.id, 'pronto')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-lg font-medium"
                      >
                        ✅ Marcar pronto
                      </button>
                    )}
                    {p.status === 'pronto' && (
                      <button
                        onClick={() => mudarStatus(p.id, 'retirado')}
                        className="bg-gray-700 hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-lg font-medium"
                      >
                        🤝 Cliente retirou
                      </button>
                    )}
                    {['aguardando_pagamento', 'pago', 'em_preparo'].includes(p.status) && (
                      <button
                        onClick={() => {
                          if (confirm(`Cancelar pedido ${p.codigo}?`)) {
                            mudarStatus(p.id, 'cancelado')
                          }
                        }}
                        className="bg-white border border-red-300 text-red-600 hover:bg-red-50 text-sm px-4 py-2 rounded-lg"
                      >
                        Cancelar
                      </button>
                    )}
                  <button
  onClick={async (e) => {
    e.stopPropagation()
    const btn = e.currentTarget
    btn.disabled = true
    btn.textContent = '⏳ Imprimindo...'
    try {
      const res = await fetch(`/api/imprimir/${p.id}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.erro || 'Erro')
      btn.textContent = '✅ Impresso'
      setTimeout(() => {
        btn.textContent = '🖨️ Imprimir'
        btn.disabled = false
      }, 2000)
    } catch (err: any) {
      alert('Erro: ' + err.message)
      btn.textContent = '🖨️ Imprimir'
      btn.disabled = false
    }
  }}
  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm px-4 py-2 rounded-lg"
>
  🖨️ Imprimir
</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}