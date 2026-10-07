'use client'

export default function Aviso({
  corPrimaria,
}: {
  corPrimaria: string
}) {
  return (
    <div
      className="border-b"
      style={{ backgroundColor: '#fff9e6', borderColor: '#f0e0b0' }}
    >
      <div className="max-w-6xl mx-auto px-6 py-3">
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0">⚠️</span>
          <div className="flex-1 text-sm leading-relaxed">
            <p className="font-bold" style={{ color: corPrimaria }}>
              Retirada somente no local
            </p>
            <p className="text-gray-700 mt-0.5">
              Não fazemos entrega. Delivery apenas pelo{' '}
              <a
                href="https://www.ifood.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline"
                style={{ color: corPrimaria }}
              >
                iFood
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
