'use client'

const COR_HEADER = '#fffe04'
const COR_TEXTO = '#1a1a1a'
const COR_TEXTO_SUAVE = 'rgba(0,0,0,0.7)'
const COR_VERMELHO = '#fa0902'

export default function Header({
  restaurante,
  status,
}: {
  restaurante: {
    nome: string
    logoUrl: string | null
    corPrimaria: string
    endereco: string | null
    tempoMedioMin: number
  }
  status: { aberto: boolean; motivo: string }
}) {
  return (
    <header
      className="sticky top-0 z-40 shadow-md"
      style={{ backgroundColor: COR_HEADER }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
        {restaurante.logoUrl ? (
          <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 shadow-md">
            <img
              src={restaurante.logoUrl}
              alt={restaurante.nome}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: 'scale(1.4)', backgroundColor: '#fa0902' }}
            />
          </div>
        ) : (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-serif flex-shrink-0 shadow-md text-white"
            style={{ backgroundColor: restaurante.corPrimaria }}
          >
            {restaurante.nome.charAt(0)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h1
            className="text-xl md:text-2xl font-serif truncate font-bold"
            style={{ color: COR_TEXTO }}
          >
            {restaurante.nome}
          </h1>

          <div
            className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mt-1"
            style={{ color: COR_TEXTO_SUAVE }}
          >
            {status.aberto ? (
              <span className="inline-flex items-center gap-1 font-semibold text-green-700">
                <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
                Aberto agora
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 font-bold"
                style={{ color: COR_VERMELHO }}
              >
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                Abriremos em breve
              </span>
            )}
            <span>•</span>
            <span>Retirada em ~{restaurante.tempoMedioMin} min</span>
            {restaurante.endereco && (
              <>
                <span>•</span>
                <span>📍 {restaurante.endereco}</span>
              </>
            )}
          </div>
        </div>

        {!status.aberto && (
          <button
            disabled
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white flex-shrink-0 shadow"
            style={{ backgroundColor: COR_VERMELHO }}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            {status.motivo}
          </button>
        )}
      </div>

      {!status.aberto && (
        <div
          className="sm:hidden px-4 py-2 text-center text-xs font-bold text-white"
          style={{ backgroundColor: COR_VERMELHO }}
        >
          {status.motivo}
        </div>
      )}
    </header>
  )
}
