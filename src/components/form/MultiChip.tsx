interface Option {
  value: string
  label: string
}

interface MultiChipProps {
  options: Option[]
  selected: string[]
  onToggle: (value: string) => void
}

export function MultiChip({ options, selected, onToggle }: MultiChipProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt.value)
        return (
          <button
            key={opt.value}
            onClick={() => onToggle(opt.value)}
            className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all duration-150
              ${active
                ? 'border-orange-500 bg-orange-500 text-white'
                : 'border-gray-200 text-gray-700 hover:border-orange-300'
              }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
