'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ModalProduto from './ModalProduto'
import Header from './Header'
import Footer from './Footer'
import Aviso from './Aviso'

type Restaurante = {
  slug: string
  nome: string
  logoUrl: string | null
  corPrimaria: string
  endereco: string | null
  tempoMedioMin: number
}

type Item = { id: string; nome: string; precoAdicional: string | null; padrao: boolean | null }
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
type Categoria = { id: string; nome: string; produtos: Produto[] }

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

export default function MenuClient({
  restaurante,
  categorias,
  status,
  whatsapp,
  horarios,
}: {
  restaurante: Restaurante
  categorias: Categoria[]
  status: { aberto: boolean; motivo: string }
  whatsapp: string | null
  horarios: any
}) {
  const router = useRouter()
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [modal, setModal] = useState<Produto | null>(null)
  const [carregado, setCarregado] = useState(false)

  const chave = `carrinho-${restaurante.slug}`

  useEffect(() => {
    const salvo = localStorage.getItem(chave)
    if (salvo) {
      try { setCarrinho(JSON.parse(salvo)) } catch {}
    }
    setCarregado(true)
  }, [chave])

  useEffect(() => {
    if (carregado) localStorage.setItem(chave, JSON.stringify(carrinho))
  }, [carrinho, chave, carregado])

  function adicionarItem(produto: Produto) {
    if (!status.aberto) {
      alert('Restaurante fechado no momento. ' + status.motivo)
      return
    }
    if (produto.grupos.length > 0 || produto.ingredientesRemoviveis.length > 0) {
      setModal(produto)
      return
    }
    setCarrinho((prev) => [
      ...prev,
      {
        produtoId: produto.id,
        nome: produto.nome,
        precoBase: Number(produto.preco),
        quantidade: 1,
        opcoes: [],
        removidos: [],
        observacao: '',
        precoTotal: Number(produto.preco),
      },
    ])
  }

  function adicionarDoModal(item: ItemCarrinho) {
    setCarrinho((prev) => [...prev, item])
    setModal(null)
  }

  function removerItem(index: number) {
    setCarrinho((prev) => prev.filter((_, i) => i !== index))
  }

  function irParaCheckout() {
    console.log('Ir para checkout, slug:', restaurante.slug)
    router.push(`/menu/${restaurante.slug}/checkout`)
  }

  const total = carrinho.reduce((s, i) => s + i.precoTotal, 0)
  const qtdTotal = carrinho.reduce((s, i) => s + i.quantidade, 0)

  return (
    <div className="min-h-screen bg-[#faf7f2] pb-32">
      <Header restaurante={restaurante} status={status} />
      <Aviso corPrimaria={restaurante.corPrimaria} />

      {!status.aberto && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-6xl mx-auto px-6 py-3 text-center">
            <p className="text-sm text-red-700 font-medium">
              🔒 Estamos fechados. {status.motivo}
            </p>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6">
        {categorias.map((cat) => (
          <section key={cat.id} className="mt-12">
            <div className="text-center mb-8">
              <h2
                className="text-2xl md:text-3xl font-serif"
                style={{ color: restaurante.corPrimaria }}
              >
                {cat.nome}
              </h2>
              <p className="text-sm text-gray-500 mt-2 italic">
                {cat.produtos.length}{' '}
                {cat.produtos.length === 1 ? 'opção disponível' : 'opções disponíveis'}
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {cat.produtos.map((p) => {
                const temOpcoes =
                  p.grupos.length > 0 || p.ingredientesRemoviveis.length > 0
                return (
                  <div
                    key={p.id}
                    onClick={() => adicionarItem(p)}
                    className={`bg-white rounded-2xl overflow-hidden shadow-sm transition group ${
                      status.aberto ? 'hover:shadow-md cursor-pointer' : 'opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      {p.imagemUrl ? (
                        <img
                          src={p.imagemUrl}
                          alt={p.nome}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300 font-serif">
                          {p.nome.charAt(0)}
                        </div>
                      )}
                      {temOpcoes && status.aberto && (
                        <span
                          className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-medium shadow text-white"
                          style={{ backgroundColor: restaurante.corPrimaria }}
                        >
                          Monte seu prato
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{p.nome}</h3>
                      {p.descricao && (
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 min-h-[60px]">
                          {p.descricao}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <span className="font-serif text-xl text-green-600">
                          R$ {Number(p.preco).toFixed(2)}
                        </span>
                        {status.aberto ? (
                          <span
                            className="text-xs px-3 py-1 rounded-full font-medium text-white"
                            style={{ backgroundColor: restaurante.corPrimaria }}
                          >
                            Adicionar
                          </span>
                        ) : (
                          <span className="text-xs px-3 py-1 rounded-full font-medium bg-gray-300 text-gray-600">
                            Fechado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        {categorias.length === 0 && (
          <p className="text-center text-gray-500 mt-16 italic">
            Cardápio vazio no momento.
          </p>
        )}
      </main>

      <Footer
        restaurante={{
          nome: restaurante.nome,
          whatsapp: whatsapp,
          endereco: restaurante.endereco,
          corPrimaria: restaurante.corPrimaria,
        }}
        horarios={horarios}
      />

      {carrinho.length > 0 && status.aberto && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-50">
          <div className="max-w-6xl mx-auto p-4">
            <details className="mb-3">
              <summary
                className="cursor-pointer text-sm font-medium select-none"
                style={{ color: restaurante.corPrimaria }}
              >
                Ver {qtdTotal} {qtdTotal === 1 ? 'item' : 'itens'} no carrinho
              </summary>
              <ul className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {carrinho.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-start text-sm border-b pb-2">
                    <div className="flex-1">
                      <p className="font-medium">
                        {item.quantidade}x {item.nome}
                      </p>
                      {item.opcoes.map((o, i) => (
                        <p key={i} className="text-xs text-gray-500">
                          {o.grupo}: {o.item}
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
                    <div className="flex items-center gap-2 ml-2">
                      <span className="font-semibold">
                        R$ {item.precoTotal.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removerItem(idx)}
                        className="text-red-500 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </details>

            <button
              type="button"
              onClick={irParaCheckout}
              className="w-full py-3 rounded-xl font-bold flex items-center justify-between px-5 shadow-lg transition text-white cursor-pointer"
              style={{ backgroundColor: restaurante.corPrimaria }}
            >
              <span>
                🛒 {qtdTotal} {qtdTotal === 1 ? 'item' : 'itens'}
              </span>
              <span>Finalizar • R$ {total.toFixed(2)}</span>
            </button>
          </div>
        </div>
      )}

      {modal && (
        <ModalProduto
          produto={modal}
          onFechar={() => setModal(null)}
          onAdicionar={adicionarDoModal}
        />
      )}
    </div>
  )
}
