import Link from 'next/link'
import { auth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { restaurantes } from '@/db/schema'

const COR_HEADER = '#fffe04'
const COR_TEXTO = '#1a1a1a'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const rest = await db.query.restaurantes.findFirst()

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header amarelo */}
      <header
        className="border-b-4 sticky top-0 z-30 shadow-md"
        style={{
          backgroundColor: COR_HEADER,
          borderBottomColor: rest?.corPrimaria ?? '#fa0902',
        }}
      >
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {rest?.logoUrl ? (
              <div
                className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 shadow-md"
                style={{ backgroundColor: cor || undefined}}
              >
                <img
                  src={rest.logoUrl}
                  alt={rest.nome}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transform: 'scale(1.4)' }}
                />
              </div>
            ) : (
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-serif font-bold text-white flex-shrink-0 shadow-md"
                style={{ backgroundColor: rest?.corPrimaria ?? '#fa0902' }}
              >
                {rest?.nome?.charAt(0) ?? 'R'}
              </div>
            )}
            <div>
              <p
                className="font-bold text-lg leading-tight font-serif"
                style={{ color: COR_TEXTO }}
              >
                {rest?.nome ?? 'Painel'}
              </p>
              <p className="text-xs" style={{ color: 'rgba(0,0,0,0.65)' }}>
                Painel do restaurante
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={`/menu/${rest?.slug ?? ''}`}
              target="_blank"
              className="hidden md:inline-flex text-xs font-medium border rounded-lg px-3 py-1.5 hover:bg-black/5 transition"
              style={{ color: COR_TEXTO, borderColor: 'rgba(0,0,0,0.2)' }}
            >
              👁️ Ver cardápio
            </Link>

            <span
              className="hidden md:block text-xs"
              style={{ color: 'rgba(0,0,0,0.55)' }}
            >
              {session.user?.email}
            </span>

            <form
              action={async () => {
                'use server'
                await signOut({ redirectTo: '/login' })
              }}
            >
              <button
                className="text-sm font-bold hover:opacity-70 transition"
                style={{ color: rest?.corPrimaria ?? '#fa0902' }}
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 bg-white border-r min-h-[calc(100vh-88px)] sticky top-24">
          <nav className="p-3 space-y-1">
            <NavItem
              href="/admin"
              label="Dashboard"
              icon="📊"
              corPrimaria={rest?.corPrimaria}
            />
            <NavItem
              href="/admin/pedidos"
              label="Pedidos"
              icon="📋"
              corPrimaria={rest?.corPrimaria}
            />
            <NavItem
              href="/admin/produtos"
              label="Produtos"
              icon="🍽️"
              corPrimaria={rest?.corPrimaria}
            />
          </nav>
        </aside>

        {/* Conteúdo */}
        <main className="flex-1 p-6 min-w-0">{children}</main>
      </div>
    </div>
  )
}

function NavItem({
  href,
  label,
  icon,
  corPrimaria,
}: {
  href: string
  label: string
  icon: string
  corPrimaria?: string | null
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition"
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  )
}
