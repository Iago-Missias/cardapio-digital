import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null

    if (!file) {
      return NextResponse.json({ erro: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Limite de 5 MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ erro: 'Arquivo maior que 5 MB' }, { status: 400 })
    }

    // Aceitar só imagens
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ erro: 'Apenas imagens são permitidas' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Nome único: timestamp + nome sanitizado
    const nomeLimpo = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-')
    const nomeFinal = `${Date.now()}-${nomeLimpo}`

    const dir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(dir, { recursive: true })

    const caminho = path.join(dir, nomeFinal)
    await writeFile(caminho, buffer)

    const url = `/uploads/${nomeFinal}`
    return NextResponse.json({ url })
  } catch (e) {
    console.error('Erro no upload:', e)
    return NextResponse.json({ erro: 'Falha no upload' }, { status: 500 })
  }
}
