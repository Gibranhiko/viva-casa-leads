interface Option {
  value: string
  label: string
  description?: string
  icon?: string
}

interface StepCardProps {
  options: Option[]
  selected: string | null
  onSelect: (value: string) => void
}

export function StepCard({ options, selected, onSelect }: StepCardProps) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-150
            ${selected === opt.value
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 hover:border-orange-300 active:scale-[0.98]'
            }`}
        >
          <div className="flex items-center gap-3">
            {opt.icon && <span className="text-2xl">{opt.icon}</span>}
            <div>
              <p className={`font-semibold ${selected === opt.value ? 'text-orange-600' : 'text-gray-900'}`}>
                {opt.label}
              </p>
              {opt.description && (
                <p className="text-sm text-gray-500 mt-0.5">{opt.description}</p>
              )}
            </div>
            {selected === opt.value && (
              <div className="ml-auto w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
