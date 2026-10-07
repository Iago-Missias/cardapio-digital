'use client'

import { useEffect } from 'react'

export default function BotaoImprimir() {
  useEffect(() => {
    // Pequeno delay pra garantir que a página renderizou
    const t = setTimeout(() => {
      window.print()
    }, 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <button
      onClick={() => window.print()}
      style={{
        backgroundColor: '#fa0902',
        color: 'white',
        padding: '10px 24px',
        borderRadius: '8px',
        fontWeight: 'bold',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
      }}
    >
      🖨️ Imprimir novamente
    </button>
  )
}
