interface ConfirmDeleteModalProps {
  name: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmDeleteModal({ name, onConfirm, onCancel, loading }: ConfirmDeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <h2 className="font-bold text-gray-900 text-lg mb-2">¿Eliminar este lead?</h2>
        <p className="text-gray-500 text-sm mb-6">
          Se eliminará <span className="font-semibold text-gray-900">{name}</span> de forma permanente.
          Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-medium text-sm hover:border-gray-300 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
