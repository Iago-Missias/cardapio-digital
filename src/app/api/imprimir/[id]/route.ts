import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { pedidos, restaurantes } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { writeFile } from 'fs/promises'

const LARGURA = 32  // Confirmado com teste real

const ESC = 0x1b
const GS = 0x1d
const LF = 0x0a

const INIT = Buffer.from([ESC, 0x40])
const LEFT = Buffer.from([ESC, 0x61, 0x00])
const CENTER = Buffer.from([ESC, 0x61, 0x01])
const RIGHT = Buffer.from([ESC, 0x61, 0x02])
const BOLD_ON = Buffer.from([ESC, 0x45, 0x01])
const BOLD_OFF = Buffer.from([ESC, 0x45, 0x00])
const BIG_ON = Buffer.from([GS, 0x21, 0x11])
const BIG_OFF = Buffer.from([GS, 0x21, 0x00])
const FEED = Buffer.from([LF, LF, LF, LF])

function txt(s: string): Buffer {
  return Buffer.from(s + '\n', 'ascii')
}

function limpar(s: string | null | undefined): string {
  if (!s) return ''
  return String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .trim()
}

function center(s: string): string {
  const t = limpar(s)
  if (t.length >= LARGURA) return t.slice(0, LARGURA)
  const pad = Math.floor((LARGURA - t.length) / 2)
  return ' '.repeat(pad) + t
}

function right(s: string): string {
  const t = limpar(s)
  if (t.length >= LARGURA) return t.slice(0, LARGURA)
  return ' '.repeat(LARGURA - t.length) + t
}

function wrap(s: string): string[] {
  const t = limpar(s)
  const palavras = t.split(' ')
  const linhas: string[] = []
  let linha = ''
  for (const p of palavras) {
    if ((linha + ' ' + p).trim().length > LARGURA) {
      if (linha) linhas.push(linha)
      linha = p
    } else {
      linha = linha ? linha + ' ' + p : p
    }
  }
  if (linha) linhas.push(linha)
  return linhas.length ? linhas : ['']
}

const DIV = '='.repeat(LARGURA)
const SUB = '-'.repeat(LARGURA)

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const pedido = await db.query.pedidos.findFirst({
      where: eq(pedidos.id, id),
    })

    if (!pedido) {
      return NextResponse.json({ erro: 'Pedido nao encontrado' }, { status: 404 })
    }

    // ✅ CORREÇÃO: verifica se restauranteId existe antes de usar no eq()
    if (!pedido.restauranteId) {
      return NextResponse.json({ erro: 'Pedido sem restaurante associado' }, { status: 400 })
    }

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
    }).replace(',', '')

    const p: Buffer[] = []

    // ============ CABECALHO ============
    p.push(INIT)
    p.push(CENTER)
    p.push(BIG_ON)
    p.push(txt(limpar(rest?.nome?.toUpperCase() ?? 'RESTAURANTE')))
    p.push(BIG_OFF)
    if (rest?.endereco) p.push(txt(limpar(rest.endereco)))
    if (rest?.whatsapp) p.push(txt(`Tel: ${limpar(rest.whatsapp)}`))
    p.push(txt(DIV))

    // ============ PEDIDO ============
    p.push(BOLD_ON)
    p.push(txt(`PEDIDO ${pedido.codigo}`))
    p.push(BOLD_OFF)
    p.push(txt(dataFmt))
    p.push(txt(SUB))

    // ============ CLIENTE ============
    p.push(LEFT)
    p.push(BOLD_ON)
    p.push(txt(`Cliente: ${limpar(pedido.clienteNome)}`))
    p.push(BOLD_OFF)
    p.push(txt(`WhatsApp: ${limpar(pedido.clienteWhatsapp)}`))
    p.push(txt(SUB))

    // ============ ITENS ============
    for (const item of itens) {
      p.push(BOLD_ON)
      p.push(txt(`${item.quantidade}x ${limpar(item.nome)}`))
      p.push(BOLD_OFF)

      if (item.opcoes) {
        for (const o of item.opcoes) {
          for (const l of wrap(`  ${limpar(o.grupo)}: ${limpar(o.item)}`)) {
            p.push(txt(l))
          }
        }
      }

      if (item.removidos?.length > 0) {
        for (const l of wrap(`  SEM: ${limpar(item.removidos.join(', '))}`)) {
          p.push(txt(l))
        }
      }

      if (item.observacao) {
        for (const l of wrap(`  Obs: ${limpar(item.observacao)}`)) {
          p.push(txt(l))
        }
      }

      p.push(RIGHT)
      p.push(txt(`R$ ${Number(item.precoTotal).toFixed(2)}`))
      p.push(LEFT)
      p.push(txt(''))
    }

    // ============ TOTAL ============
    p.push(txt(DIV))
    p.push(RIGHT)
    p.push(BOLD_ON)
    p.push(BIG_ON)
    p.push(txt(`R$ ${Number(pedido.total).toFixed(2)}`))
    p.push(BIG_OFF)
    p.push(BOLD_OFF)
    p.push(CENTER)
    p.push(txt(''))

    // ============ RODAPE ============
    p.push(txt('PAGAMENTO NA RETIRADA'))
    p.push(txt('(Pix / Dinheiro / Cartao)'))
    p.push(txt(DIV))
    p.push(txt(''))
    p.push(txt('Obrigado pela preferencia!'))
    p.push(FEED)

    const buffer = Buffer.concat(p)

    const device = process.env.PRINTER_DEVICE ?? '/dev/usb/lp2'
    await writeFile(device, buffer)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Erro:', e)
    return NextResponse.json({ erro: e?.message ?? 'Erro' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    device: process.env.PRINTER_DEVICE ?? '/dev/usb/lp2',
    largura: LARGURA,
  })
}