import { useState, useMemo, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useSellerLeads } from '@/hooks/useSellerLeads'
import { useNavigate } from 'react-router'
import imagotipo from '@/assets/imagotipo.png'
import type { RedFlag } from '@/types/sellerLead'

const STATUS_COLORS: Record<string, string> = {
  nuevo:       'bg-blue-100 text-blue-700',
  contactado:  'bg-yellow-100 text-yellow-700',
  en_proceso:  'bg-purple-100 text-purple-700',
  cerrado:     'bg-green-100 text-green-700',
  descartado:  'bg-gray-100 text-gray-500',
}

const STATUS_LABELS: Record<string, string> = {
  nuevo:      'Nuevo',
  contactado: 'Contactado',
  en_proceso: 'En proceso',
  cerrado:    'Cerrado',
  descartado: 'Descartado',
}

const TIPO_LABELS: Record<string, string> = {
  fraccionamiento: 'Fracc.',
  colonia:         'Colonia',
  departamento:    'Depto.',
  terreno:         'Terreno',
}

const URGENCIA_LABELS: Record<string, string> = {
  urgente:   'Urgente',
  '3_meses': '3 meses',
  sin_prisa: 'Sin prisa',
}

const URGENCIA_COLORS: Record<string, string> = {
  urgente:   'text-red-600 font-semibold',
  '3_meses': 'text-yellow-600',
  sin_prisa: 'text-gray-500',
}

const MUNICIPIOS = [
  'Monterrey', 'San Pedro Garza García', 'San Nicolás de los Garza',
  'Guadalupe', 'Apodaca', 'General Escobedo', 'García',
  'Santa Catarina', 'Juárez', 'Cadereyta Jiménez',
]

function RedFlagsCell({ flags }: { flags: RedFlag[] }) {
  const cesion = flags.includes('cesion_infonavit_interes')
  const warningCount = flags.filter((f) => f !== 'cesion_infonavit_interes').length

  if (flags.length === 0) {
    return <span className="text-xs text-gray-300">—</span>
  }

  return (
    <div className="flex items-center gap-1.5">
      {warningCount > 0 && (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
          ${warningCount >= 3 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
          ⚠ {warningCount}
        </span>
      )}
      {cesion && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
          ★ Cesión
        </span>
      )}
    </div>
  )
}

export function SellerLeadsPage() {
  const { leads, loading, loadingMore, hasMore, loadInitial, loadMore } = useSellerLeads()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterMunicipio, setFilterMunicipio] = useState('')
  const [filterUrgencia, setFilterUrgencia] = useState('')

  useEffect(() => { loadInitial() }, [loadInitial])

  const filtered = useMemo(() => {
    let result = leads
    if (filterMunicipio) result = result.filter((l) => l.municipio === filterMunicipio)
    if (filterUrgencia) result = result.filter((l) => l.urgencia === filterUrgencia)
    if (search) result = result.filter((l) => l.nombre.toLowerCase().includes(search.toLowerCase()))
    return result
  }, [leads, filterMunicipio, filterUrgencia, search])

  const resetFilters = () => {
    setFilterMunicipio(''); setFilterUrgencia(''); setSearch('')
  }

  const hasFilters = filterMunicipio || filterUrgencia || search
  const selectClass = "border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={imagotipo} alt="Viva Casa" className="h-8 object-contain" />
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">Viva Casa</p>
            <p className="text-xs text-gray-400 leading-tight">Vendedores Admin</p>
          </div>
          {/* Nav tabs */}
          <div className="hidden sm:flex items-center gap-1 ml-4 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => navigate('/admin')}
              className="px-3 py-1.5 text-xs font-medium rounded-md text-gray-500 hover:text-gray-700 transition-colors"
            >
              Compradores
            </button>
            <button
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-white text-orange-600 shadow-sm"
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
            onClick={() => signOut(auth)}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Salir
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 min-w-44"
          />
          <select value={filterMunicipio} onChange={(e) => setFilterMunicipio(e.target.value)} className={selectClass}>
            <option value="">Todos los municipios</option>
            {MUNICIPIOS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={filterUrgencia} onChange={(e) => setFilterUrgencia(e.target.value)} className={selectClass}>
            <option value="">Toda urgencia</option>
            {Object.entries(URGENCIA_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          {hasFilters && (
            <button onClick={resetFilters} className="text-sm text-orange-500 underline px-1">
              Limpiar
            </button>
          )}
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
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Municipio</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Tipo</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Urgencia</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Flags</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead, i) => (
                    <tr
                      key={lead.id}
                      onClick={() => navigate(`/admin/vendedores/${lead.id}`)}
                      className={`border-b border-gray-100 cursor-pointer hover:bg-orange-50 transition-colors
                        ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{lead.nombre}</td>
                      <td className="px-4 py-3 text-gray-600">{lead.whatsapp}</td>
                      <td className="px-4 py-3 text-gray-500">{lead.municipio || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {lead.tipoPropiedad ? (TIPO_LABELS[lead.tipoPropiedad] ?? lead.tipoPropiedad) : '—'}
                      </td>
                      <td className={`px-4 py-3 text-xs ${lead.urgencia ? URGENCIA_COLORS[lead.urgencia] ?? '' : 'text-gray-400'}`}>
                        {lead.urgencia ? (URGENCIA_LABELS[lead.urgencia] ?? lead.urgencia) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <RedFlagsCell flags={lead.redFlags} />
                      </td>
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

        {hasMore && !loading && (
          <div className="flex flex-col items-center gap-1 mt-4">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {loadingMore ? 'Cargando...' : 'Cargar más leads'}
            </button>
            <p className="text-xs text-gray-400">{leads.length} leads cargados</p>
          </div>
        )}
      </div>
    </div>
  )
}
