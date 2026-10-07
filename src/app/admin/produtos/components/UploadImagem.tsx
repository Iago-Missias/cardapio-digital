'use client'

import { useState } from 'react'

export default function UploadImagem({
  valorInicial = '',
  name = 'imagemUrl',
}: {
  valorInicial?: string
  name?: string
}) {
  const [url, setUrl] = useState(valorInicial)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  async function enviar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setErro('')
    setEnviando(true)

    const fd = new FormData()
    fd.append('file', file)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()

      if (!res.ok) {
        setErro(data.erro ?? 'Erro ao enviar')
      } else {
        setUrl(data.url)
      }
    } catch {
      setErro('Falha na conexão')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-2">
      {/* Esse campo é o que vai pro Server Action */}
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className="relative inline-block">
          <img
            src={url}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border"
          />
          <button
            type="button"
            onClick={() => setUrl('')}
            className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full text-xs hover:bg-red-700"
          >
            ✕
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
          {enviando ? (
            <span className="text-xs text-gray-500">Enviando...</span>
          ) : (
            <>
              <span className="text-2xl text-gray-400">📷</span>
              <span className="text-xs text-gray-500 mt-1">Escolher foto</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={enviar}
            disabled={enviando}
            className="hidden"
          />
        </label>
      )}

      {erro && <p className="text-xs text-red-600">{erro}</p>}
    </div>
  )
}
