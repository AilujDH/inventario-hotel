'use client'

interface CounterProps {
  value: number
  onChange: (val: number) => void
  min?: number
  step?: number
}

export function Counter({ value, onChange, min = 0, step = 1 }: CounterProps) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onChange(Math.max(min, value - step))}
        className="w-7 h-7 border border-stone bg-paper2 rounded-md flex items-center justify-center text-base text-ink hover:bg-stone transition-colors"
      >−</button>

      {/* Input directo — Mariana puede escribir el número */}
      <input
        type="number"
        min={min}
        step={step}
        value={value || ''}
        placeholder="0"
        onChange={e => {
          const v = parseFloat(e.target.value)
          onChange(isNaN(v) ? 0 : Math.max(min, v))
        }}
        className="w-16 text-center border border-stone rounded-md bg-paper text-sm px-1 py-1.5
                   focus:outline-none focus:border-rust focus:bg-white"
      />

      <button
        onClick={() => onChange(value + step)}
        className="w-7 h-7 border border-stone bg-paper2 rounded-md flex items-center justify-center text-base text-ink hover:bg-stone transition-colors"
      >+</button>
    </div>
  )
}
