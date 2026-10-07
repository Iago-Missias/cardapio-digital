export default function AdminHome() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Pedidos hoje</p>
          <p className="text-3xl font-bold mt-1">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Faturamento hoje</p>
          <p className="text-3xl font-bold mt-1 text-green-600">R$ 0,00</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Ticket médio</p>
          <p className="text-3xl font-bold mt-1">R$ 0,00</p>
        </div>
      </div>
    </div>
  )
}
