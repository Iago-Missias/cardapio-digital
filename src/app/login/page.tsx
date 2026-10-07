import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'

export default function LoginPage() {
  async function login(formData: FormData) {
    'use server'
    try {
      await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirectTo: '/admin',
      })
    } catch (error) {
      if (error instanceof AuthError) {
        redirect('/login?error=1')
      }
      throw error
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form action={login} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Painel Admin</h1>

        <label className="block mb-3">
          <span className="text-sm text-gray-700">Email</span>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </label>

        <label className="block mb-6">
          <span className="text-sm text-gray-700">Senha</span>
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </label>

        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700"
        >
          Entrar
        </button>
      </form>
    </div>
  )
}