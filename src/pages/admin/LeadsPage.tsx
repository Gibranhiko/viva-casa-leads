import { useState, useMemo, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useLeads } from '@/hooks/useLeads'
import { exportToCSV } from '@/lib/exportCsv'
import { useNavigate } from 'react-router'
import imagotipo from '@/assets/imagotipo.png'


const STATUS_COLORS: Record<string, string> = {
  nuevo: 'bg-blue-100 text-blue-700',
  contactado: 'bg-yellow-100 text-yellow-700',
  calificado: 'bg-green-100 text-green-700',
  descartado: 'bg-gray-100 text-gray-500',
}

const STATUS_LABELS: Record<string, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  calificado: 'Calificado',
  descartado: 'Descartado',
}

const CREDITO_LABELS: Record<string, string> = {
  infonavit_tradicional: 'INFONAVIT Trad.',
  infonavit_total: 'INFONAVIT Total',
  cofinavit: 'COFINAVIT',
  unamos_creditos: 'Unamos',
  segundo_credito: '2do Crédito',
  banco: 'Banco',
  recursos_propios: 'Propios',
}

const ZONA_LABELS: Record<string, string> = {
  monterrey: 'Mty', san_pedro: 'S.Pedro', santa_catarina: 'Sta.Cat',
  guadalupe: 'Gpe', apodaca: 'Apodaca', escobedo: 'Escobedo',
  garcia: 'García', juarez: 'Juárez', san_nicolas: 'S.Nicolás',
  cadereyta: 'Cadereyta', indiferente: 'Indiferente',
}

export function LeadsPage() {
  const { leads, loading, loadingMore, hasMore, loadInitial, loadMore } = useLeads()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterCredito, setFilterCredito] = useState('')
  const [filterZonas, setFilterZonas] = useState<string[]>([])

  useEffect(() => { loadInitial() }, [loadInitial])

  const toggleZona = (zona: string) => {
    setFilterZonas((prev) =>
      prev.includes(zona) ? prev.filter((z) => z !== zona) : [...prev, zona]
    )
  }

  const filtered = useMemo(() => {
    let result = leads
    if (filterCredito) result = result.filter((l) => l.tipoCredito === filterCredito)
    if (filterZonas.length > 0)
      result = result.filter((l) => filterZonas.some((z) => (l.zonasInteres as string[]).includes(z)))
    if (search)
      result = result.filter((l) => l.nombre.toLowerCase().includes(search.toLowerCase()))
    return result
  }, [leads, filterCredito, filterZonas, search])

  const resetFilters = () => {
    setFilterCredito(''); setFilterZonas([]); setSearch('')
  }

  const selectClass = "border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={imagotipo} alt="Viva Casa" className="h-8 object-contain" />
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">Viva Casa</p>
            <p className="text-xs text-gray-400 leading-tight">Compradores Admin</p>
          </div>
          {/* Nav tabs */}
          <div className="hidden sm:flex items-center gap-1 ml-4 bg-gray-100 rounded-lg p-1">
            <button
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-white text-orange-600 shadow-sm"
            >
              Compradores
            </button>
            <button
              onClick={() => navigate('/admin/vendedores')}
              className="px-3 py-1.5 text-xs font-medium rounded-md text-gray-500 hover:text-gray-700 transition-colors"
            >
              Vendedores
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:block">
            {leads.length} cargados · {filtered.length} mostrados
          </span>
          <button
            onClick={() => exportToCSV(filtered)}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-3 py-2 rounded-lg transition-colors"
          >
            Exportar CSV
          </button>
          <button
            onClick={() => signOut(auth)}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Salir
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtros */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre..."
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 min-w-44"
            />
            <select value={filterCredito} onChange={(e) => setFilterCredito(e.target.value)} className={selectClass}>
              <option value="">Todos los créditos</option>
              {Object.entries(CREDITO_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            {(filterCredito || filterZonas.length > 0 || search) && (
              <button onClick={resetFilters} className="text-sm text-orange-500 underline px-1">
                Limpiar
              </button>
            )}
          </div>

          {/* Zonas multiselect chips */}
          <div className="flex flex-wrap gap-1.5">
            {[
              ['monterrey', 'Monterrey'], ['san_pedro', 'San Pedro'], ['santa_catarina', 'Santa Catarina'],
              ['guadalupe', 'Guadalupe'], ['apodaca', 'Apodaca'], ['escobedo', 'Escobedo'],
              ['garcia', 'García'], ['juarez', 'Juárez'], ['san_nicolas', 'San Nicolás'], ['cadereyta', 'Cadereyta'],
            ].map(([v, l]) => (
              <button
                key={v}
                onClick={() => toggleZona(v)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all
                  ${filterZonas.includes(v)
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'
                  }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Cargando leads...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No hay leads con esos filtros</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Nombre</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">WhatsApp</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Zonas</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Crédito</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead, i) => (
                    <tr
                      key={lead.id}
                      onClick={() => navigate(`/admin/leads/${lead.id}`)}
                      className={`border-b border-gray-100 cursor-pointer hover:bg-orange-50 transition-colors
                        ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{lead.nombre}</td>
                      <td className="px-4 py-3 text-gray-600">{lead.whatsapp}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {(lead.zonasInteres as string[])
                          .map((z) => ZONA_LABELS[z] ?? z)
                          .join(', ') || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{CREDITO_LABELS[lead.tipoCredito] ?? lead.tipoCredito}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {STATUS_LABELS[lead.status] ?? lead.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Cargar más */}
        {hasMore && !loading && (
          <div className="flex flex-col items-center gap-1 mt-4">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {loadingMore ? 'Cargando...' : 'Cargar más leads'}
            </button>
            <p className="text-xs text-gray-400">
              {leads.length} leads cargados
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
