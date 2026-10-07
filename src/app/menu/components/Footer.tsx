'use client'

const COR_HEADER = '#fffe04'
const COR_TEXTO = '#1a1a1a'

const DIAS = [
  { nome: 'Domingo', dia: 0 },
  { nome: 'Segunda', dia: 1 },
  { nome: 'Terça', dia: 2 },
  { nome: 'Quarta', dia: 3 },
  { nome: 'Quinta', dia: 4 },
  { nome: 'Sexta', dia: 5 },
  { nome: 'Sábado', dia: 6 },
]

type HorarioDia = {
  aberto: boolean
  inicio?: string
  fim?: string
}

type Horarios = {
  [dia: number]: HorarioDia
}

export default function Footer({
  restaurante,
  horarios,
}: {
  restaurante: {
    nome: string
    whatsapp: string | null
    endereco: string | null
    corPrimaria: string
  }
  horarios: Horarios | null
}) {
  const h = horarios ?? {}

  return (
    <footer
      className="mt-16 border-t-4"
      style={{
        backgroundColor: COR_HEADER,
        borderTopColor: restaurante?.corPrimaria ?? "#fa0902",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Grid de 3 colunas */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2rem',
          }}
        >
          {/* Coluna 1 — Sobre */}
          <div>
            <h3
              className="font-serif text-lg font-bold mb-3"
              style={{ color: COR_TEXTO }}
            >
              {restaurante?.nome ?? ""}
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'rgba(0,0,0,0.7)' }}
            >
              Comida típica feita com carinho.
              <br />
              Retirada no local.
            </p>
          </div>

          {/* Coluna 2 — Horários */}
          <div>
            <h3
              className="font-serif text-lg font-bold mb-3"
              style={{ color: COR_TEXTO }}
            >
              Horários
            </h3>
            <ul className="space-y-1">
              {DIAS.map((d) => {
                const config = h[d.dia]
                const aberto = config?.aberto
                const inicio = config?.inicio
                const fim = config?.fim

                return (
                  <li
                    key={d.dia}
                    className="flex justify-between text-sm"
                    style={{ color: 'rgba(0,0,0,0.75)' }}
                  >
                    <span className="font-medium">{d.nome}</span>
                    <span>
                      {aberto && inicio && fim
                        ? `${inicio} – ${fim}`
                        : 'Fechado'}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Coluna 3 — Contato */}
          <div>
            <h3
              className="font-serif text-lg font-bold mb-3"
              style={{ color: COR_TEXTO }}
            >
              Contato
            </h3>

            {restaurante?.endereco && (
              <p
                className="text-sm mb-3 leading-relaxed"
                style={{ color: 'rgba(0,0,0,0.75)' }}
              >
                📍 {restaurante.endereco}
              </p>
            )}

            {restaurante?.whatsapp && (
              <a
                href={`https://wa.me/${restaurante?.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white shadow transition hover:opacity-90"
                style={{ backgroundColor: restaurante?.corPrimaria ?? "#fa0902" }}
              >
                💬 WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* Linha inferior */}
        <div
          className="mt-8 pt-6 text-center text-xs"
          style={{
            borderTop: '1px solid rgba(0,0,0,0.1)',
            color: 'rgba(0,0,0,0.55)',
          }}
        >
          © {new Date().getFullYear()} {restaurante?.nome ?? ""} · Todos os direitos
          reservados
        </div>
      </div>
    </footer>
  )
}
