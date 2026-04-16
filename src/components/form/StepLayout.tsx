interface StepLayoutProps {
  title: string
  subtitle?: string
  onNext?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  hideNext?: boolean
  children: React.ReactNode
}

export function StepLayout({
  title,
  subtitle,
  onNext,
  nextLabel = 'Continuar',
  nextDisabled = false,
  hideNext = false,
  children,
}: StepLayoutProps) {
  return (
    <div className="px-6 pt-8 pb-6 max-w-lg mx-auto w-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      {subtitle && <p className="text-gray-500 mb-6">{subtitle}</p>}
      {!subtitle && <div className="mb-6" />}
      {children}

      {!hideNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-lg py-4 rounded-2xl transition-colors mt-6"
        >
          {nextLabel}
        </button>
      )}
    </div>
  )
}
