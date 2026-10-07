import { db } from '@/db'
import { pedidos, restaurantes } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import BotaoImprimir from './BotaoImprimir'

export const dynamic = 'force-dynamic'

export default async function ImprimirPedidoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const pedido = await db.query.pedidos.findFirst({
    where: eq(pedidos.id, id),
  })

  if (!pedido) notFound()

  const rest = await db.query.restaurantes.findFirst({
    where: eq(restaurantes.id, pedido.restauranteId),
  })

  const itens = (pedido.itens as any[]) ?? []
  const data = new Date(pedido.criadoEm!)
  const dataFmt = data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: 58mm auto;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
        }
        body {
          margin: 0;
          padding: 0;
          background: #f5f5f5;
          font-family: 'Courier New', monospace;
        }
        .cupom {
          width: 58mm;
          background: white;
          margin: 20px auto;
          padding: 4mm 3mm;
          font-size: 11px;
          line-height: 1.35;
          color: #000;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .linha {
          border-top: 1px dashed #000;
          margin: 4px 0;
        }
        .linha-solida {
          border-top: 1px solid #000;
          margin: 4px 0;
        }
        .item-nome {
          font-weight: bold;
          font-size: 12px;
        }
        .item-detalhe {
          padding-left: 8px;
          font-size: 10px;
        }
        .total {
          font-size: 14px;
          font-weight: bold;
          text-align: right;
          margin-top: 4px;
        }
        .titulo {
          font-size: 14px;
          font-weight: bold;
        }
      `}</style>

      <div className="no-print" style={{ textAlign: 'center', padding: '16px' }}>
        <BotaoImprimir />
        <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
          Se a janela de impressão não abrir, clique no botão acima.
        </p>
      </div>

      <div className="cupom">
        {/* Cabeçalho */}
        <div className="center titulo">
          {rest?.nome?.toUpperCase() ?? 'RESTAURANTE'}
        </div>
        {rest?.endereco && (
          <div className="center" style={{ fontSize: '10px' }}>
            {rest.endereco}
          </div>
        )}
        {rest?.whatsapp && (
          <div className="center" style={{ fontSize: '10px' }}>
            Tel: {rest.whatsapp}
          </div>
        )}

        <div className="linha-solida" />

        {/* Dados do pedido */}
        <div className="bold center" style={{ fontSize: '13px' }}>
          PEDIDO {pedido.codigo}
        </div>
        <div className="center" style={{ fontSize: '10px' }}>
          {dataFmt}
        </div>

        <div className="linha" />

        <div>Cliente: <span className="bold">{pedido.clienteNome}</span></div>
        <div>WhatsApp: {pedido.clienteWhatsapp}</div>

        <div className="linha" />

        {/* Itens */}
        <div className="bold" style={{ marginBottom: '4px' }}>
          ITENS:
        </div>
        {itens.map((item: any, idx: number) => (
          <div key={idx} style={{ marginBottom: '6px' }}>
            <div className="item-nome">
              {item.quantidade}x {item.nome}
            </div>
            {item.opcoes?.map((o: any, i: number) => (
              <div key={i} className="item-detalhe">
                • {o.grupo}: {o.item}
              </div>
            ))}
            {item.removidos?.length > 0 && (
              <div className="item-detalhe bold">
                • SEM: {item.removidos.join(', ')}
              </div>
            )}
            {item.observacao && (
              <div className="item-detalhe">
                • Obs: {item.observacao}
              </div>
            )}
            <div style={{ textAlign: 'right', fontSize: '11px' }}>
              R$ {Number(item.precoTotal).toFixed(2)}
            </div>
          </div>
        ))}

        <div className="linha-solida" />

        {/* Total */}
        <div className="total">
          TOTAL: R$ {Number(pedido.total).toFixed(2)}
        </div>

        <div className="linha" />

        {/* Aviso */}
        <div className="center" style={{ fontSize: '10px' }}>
          PAGAMENTO NA RETIRADA
        </div>
        <div className="center" style={{ fontSize: '10px' }}>
          (Pix / Dinheiro / Cartão)
        </div>

        <div className="linha" />

        <div className="center bold" style={{ fontSize: '11px' }}>
          Obrigado pela preferência!
        </div>
        <div className="center" style={{ fontSize: '9px' }}>
          *** Canto do Acarajé ***
        </div>

        {/* Espaço final pro corte */}
        <div style={{ height: '20px' }} />
      </div>
    </>
  )
}
