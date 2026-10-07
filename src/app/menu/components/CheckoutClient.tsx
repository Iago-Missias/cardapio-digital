'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { criarPedido, type ItemPedido } from '../actions'

type Restaurante = {
  slug: string
  nome: string
  logoUrl: string | null
  corPrimaria: string
  endereco: string | null
  whatsapp: string | null
  tempoMedioMin: number
}

export default function CheckoutClient({
  restaurante,
  status,
}: {
  restaurante: Restaurante
  status: { aberto: boolean; motivo: string }
}) {
  const router = useRouter()
  const [itens, setItens] = useState<ItemPedido[]>([])
  const [carregado, setCarregado] = useState(false)
  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, startTransition] = useTransition()

  const chave = `carrinho-${restaurante.slug}`

  useEffect(() => {
    const salvo = localStorage.getItem(chave)
    if (salvo) {
      try { setItens(JSON.parse(salvo)) } catch {}
    }
    setCarregado(true)
  }, [chave])

  // Se o carrinho está vazio, volta pro menu
  useEffect(() => {
    if (carregado && itens.length === 0) {
      router.replace(`/menu/${restaurante.slug}`)
    }
  }, [carregado, itens, router, restaurante.slug])

  const total = itens.reduce((s, i) => s + i.precoTotal, 0)

  function mascaraWhats(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 2) return d
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  }

  function enviar() {
    setErro('')

    if (!nome.trim()) {
      setErro('Informe seu nome')
      return
    }
    const apenasDigitos = whatsapp.replace(/\D/g, '')
    if (apenasDigitos.length < 10) {
      setErro('Informe um WhatsApp válido com DDD')
      return
    }

    if (!status.aberto) {
      setErro('Restaurante fechado no momento. ' + status.motivo)
      return
    }

    startTransition(async () => {
      const res = await criarPedido({
        slug: restaurante.slug,
        clienteNome: nome,
        clienteWhatsapp: apenasDigitos,
        itens,
      })

      if (!res.ok) {
        setErro(res.erro)
        return
      }

      localStorage.removeItem(chave)
      router.push(`/pedido/${res.codigo}`)
    })
  }

  if (!carregado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <p className="text-gray-500">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] pb-32">
      {/* Header */}
      <header
        className="sticky top-0 z-40 shadow-md"
        style={{ backgroundColor: '#fffe04' }}
      >
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href={`/menu/${restaurante.slug}`}
            className="text-sm font-bold text-black/70 hover:text-black"
          >
            ← Voltar
          </Link>
          <h1 className="flex-1 text-lg font-bold text-black/90">
            Finalizar Pedido
          </h1>
        </div>
      </header>

      {/* Aviso */}
      <div className="bg-[#fff9e6] border-b border-[#f0e0b0]">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div className="text-sm">
            <p className="font-bold" style={{ color: restaurante.corPrimaria }}>
              Retirada somente no local
            </p>
            <p className="text-gray-700">
              Não fazemos entrega. Delivery apenas pelo iFood.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-6 space-y-6">
        {!status.aberto && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700 font-medium">
              🔒 Restaurante fechado. {status.motivo}
            </p>
          </div>
        )}

        {/* Resumo dos itens */}
        <section className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-3">Seu pedido</h2>

          <ul className="space-y-3">
            {itens.map((item, idx) => (
              <li
                key={idx}
                className="flex justify-between items-start border-b pb-3 last:border-0"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {item.quantidade}x {item.nome}
                  </p>
                  {item.opcoes.map((o, i) => (
                    <p key={i} className="text-xs text-gray-500">
                      {o.grupo}: {o.item}
                      {o.preco > 0 && ` (+R$ ${o.preco.toFixed(2)})`}
                    </p>
                  ))}
                  {item.removidos.length > 0 && (
                    <p className="text-xs text-red-500">
                      Sem: {item.removidos.join(', ')}
                    </p>
                  )}
                  {item.observacao && (
                    <p className="text-xs text-gray-400 italic">
                      Obs: {item.observacao}
                    </p>
                  )}
                </div>
                <span className="font-semibold ml-3">
                  R$ {item.precoTotal.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-dashed">
            <span className="font-bold text-gray-700">Total</span>
            <span className="text-2xl font-serif font-bold text-green-600">
              R$ {total.toFixed(2)}
            </span>
          </div>
        </section>

        {/* Dados do cliente */}
        <section className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-gray-900">Seus dados</h2>

          <label className="block">
            <span className="text-sm text-gray-700 font-medium">
              Nome completo *
            </span>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Maria Silva"
              className="mt-1 w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2"
              style={{ borderColor: '#e5e7eb' }}
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700 font-medium">
              WhatsApp (com DDD) *
            </span>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(mascaraWhats(e.target.value))}
              placeholder="(11) 99999-9999"
              className="mt-1 w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2"
              style={{ borderColor: '#e5e7eb' }}
            />
            <span className="text-xs text-gray-500 mt-1 block">
              Usaremos para avisar quando o pedido estiver pronto
            </span>
          </label>
        </section>

        {/* Info de pagamento */}
        <section
          className="rounded-2xl p-5"
          style={{ backgroundColor: '#fff9e6', border: '2px solid #f0e0b0' }}
        >
          <h2
            className="font-bold mb-2 text-lg"
            style={{ color: restaurante.corPrimaria }}
          >
            💵 Pagamento na retirada
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            Aceitamos <strong>Pix</strong>, <strong>dinheiro</strong> e{' '}
            <strong>cartão</strong>. O pagamento é feito{' '}
            <strong>direto no balcão</strong> quando você vier retirar seu
            pedido.
          </p>
          {restaurante.endereco && (
            <p className="text-xs text-gray-500 mt-3">
              📍 {restaurante.endereco}
            </p>
          )}
        </section>

        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700">{erro}</p>
          </div>
        )}
      </main>

      {/* Botão fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl">
        <div className="max-w-3xl mx-auto p-4">
          <button
            onClick={enviar}
            disabled={enviando || !status.aberto || itens.length === 0}
            className="w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: restaurante.corPrimaria }}
          >
            {enviando
              ? 'Enviando...'
              : !status.aberto
              ? 'Restaurante fechado'
              : `Confirmar pedido • R$ ${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  )
}