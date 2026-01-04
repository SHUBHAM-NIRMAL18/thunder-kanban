export const BoardSkeleton = () => {
  return (
    <div className="h-full flex flex-col animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="h-9 w-28 bg-gray-200 rounded-lg" />
      </div>

      <div className="flex-1 flex gap-0">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-80 flex-shrink-0 border-r-2 border-gray-200 p-4"
          >
            <div className="h-6 w-24 bg-gray-200 rounded mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-24 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}