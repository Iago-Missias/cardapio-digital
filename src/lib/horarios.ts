// 0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado
export type HorarioDia = {
  aberto: boolean
  inicio?: string  // "12:00"
  fim?: string     // "15:30"
}

export type Horarios = {
  [dia: number]: HorarioDia
}

export const HORARIOS_PADRAO: Horarios = {
  0: { aberto: true, inicio: '12:00', fim: '16:30' },
  1: { aberto: false },
  2: { aberto: true, inicio: '12:00', fim: '15:30' },
  3: { aberto: true, inicio: '12:00', fim: '15:30' },
  4: { aberto: true, inicio: '12:00', fim: '15:30' },
  5: { aberto: true, inicio: '12:00', fim: '15:30' },
  6: { aberto: true, inicio: '12:00', fim: '20:30' },
}

function paraMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function estaAberto(horarios: Horarios | null | undefined): {
  aberto: boolean
  motivo: string
} {
  const h =
    horarios && Object.keys(horarios).length > 0 ? horarios : HORARIOS_PADRAO

  // Data/hora atual no fuso do Brasil
  const agora = new Date()
  const brasil = new Date(
    agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
  )

  const dia = brasil.getDay()
  const minutosAgora = brasil.getHours() * 60 + brasil.getMinutes()

  const config = h[dia]

  if (!config || !config.aberto || !config.inicio || !config.fim) {
    // Fechado hoje — procura próximo dia aberto
    const nomes = [
      'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado',
    ]
    for (let i = 1; i <= 7; i++) {
      const proxDia = (dia + i) % 7
      const c = h[proxDia]
      if (c?.aberto && c.inicio) {
        return {
          aberto: false,
          motivo: `Abrimos ${nomes[proxDia]} às ${c.inicio}`,
        }
      }
    }
    return { aberto: false, motivo: 'Fechado' }
  }

  const inicio = paraMinutos(config.inicio)
  const fim = paraMinutos(config.fim)

  if (minutosAgora < inicio) {
    return {
      aberto: false,
      motivo: `Abrimos hoje às ${config.inicio}`,
    }
  }

  if (minutosAgora > fim) {
    return {
      aberto: false,
      motivo: `Fechamos hoje às ${config.fim}`,
    }
  }

  return {
    aberto: true,
    motivo: `Aberto até ${config.fim}`,
  }
}
