interface SectionProps {
  step: number
  title: string
  isLocked?: boolean
  children: React.ReactNode
}

export function Section({ step, title, isLocked = false, children }: SectionProps) {
  return (
    <div className={`bg-white rounded-2xl border transition-all ${isLocked ? 'border-gray-100 opacity-50' : 'border-gray-200 shadow-sm'}`}>
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isLocked ? 'bg-gray-200 text-gray-400' : 'bg-orange-500 text-white'}`}>
          {step}
        </div>
        <h2 className={`font-semibold text-base ${isLocked ? 'text-gray-400' : 'text-gray-800'}`}>{title}</h2>
      </div>
      <div className="px-6 py-5">
        {isLocked
          ? <p className="text-sm text-gray-400">Completa el paso anterior para continuar.</p>
          : children
        }
      </div>
    </div>
  )
}
