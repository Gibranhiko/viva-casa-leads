function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`bg-gray-200 rounded-lg animate-pulse ${className ?? ''}`} />
}

export function DetailSkeleton() {
  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <SkeletonBlock className="w-12 h-4" />
        <SkeletonBlock className="flex-1 h-5 max-w-[180px]" />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
        <div className="flex gap-2">
          <SkeletonBlock className="w-36 h-11 rounded-xl" />
          <SkeletonBlock className="w-28 h-11 rounded-xl" />
        </div>

        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3">
            <SkeletonBlock className="w-24 h-3 mb-1" />
            <SkeletonBlock className="w-full h-4" />
            <SkeletonBlock className="w-3/4 h-4" />
            <SkeletonBlock className="w-1/2 h-4" />
          </div>
        ))}
      </div>
    </div>
  )
}
