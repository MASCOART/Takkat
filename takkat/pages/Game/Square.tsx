interface SquareProps {
  value: string | null
  onClick: () => void
}

export default function Square({ value, onClick }: SquareProps) {
  return (
    <button
      className="flex h-24 w-24 items-center justify-center border border-gray-700 text-5xl font-bold transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-opacity-50 lowercase"
      onClick={onClick}
    >
      {value === 'x' && (
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-14 w-1 bg-gray-500 rotate-45 transform origin-center" />
            <div className="h-14 w-1 bg-gray-500 -rotate-45 transform origin-center" />
          </div>
        </div>
      )}
      {value === 'o' && (
        <div className="h-12 w-12 rounded-full border-4 border-gray-500" />
      )}
    </button>
  )
}

