import { Search, LocateFixed, Sun, Moon } from 'lucide-react'
import { CATEGORIES, RADII } from '../data/categories'
import { radiusLabel } from '../utils/geo'

export default function FilterPanel({ query, setQuery, selected, toggle, setAll, radius, setRadius,
  onLocate, locating, dark, toggleTheme }) {
  return (
    <div className="space-y-3 border-b border-slate-200 p-3 dark:border-slate-800">
      <div className="flex items-center gap-2">
        <h1 className="flex-1 text-lg font-semibold">Yaqin joylar</h1>
        <button onClick={onLocate} aria-label="Mening joylashuvim"
          className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
          <LocateFixed size={20} className={locating ? 'animate-pulse text-blue-500' : ''} />
        </button>
        <button onClick={toggleTheme} aria-label="Rejimni almashtirish"
          className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700">
        <Search size={16} className="text-slate-400" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Nom bo'yicha qidirish"
          className="w-full bg-transparent text-sm outline-none" />
      </label>

      <div className="flex gap-1.5">
        {RADII.map(r => (
          <button key={r} onClick={() => setRadius(r)}
            className={`flex-1 rounded-lg border px-2 py-1.5 text-sm ${radius === r
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-slate-300 dark:border-slate-700'}`}>
            {radiusLabel(r)}
          </button>
        ))}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button onClick={setAll} className="shrink-0 rounded-full border border-slate-300 px-3 py-1 text-sm dark:border-slate-700">
          {selected.length === CATEGORIES.length ? 'Tozalash' : 'Hammasi'}
        </button>
        {CATEGORIES.map(c => {
          const on = selected.includes(c.id), Icon = c.icon
          return (
            <button key={c.id} onClick={() => toggle(c.id)} aria-pressed={on}
              style={on ? { background: c.color, borderColor: c.color } : undefined}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${on
                ? 'text-white' : 'border-slate-300 dark:border-slate-700'}`}>
              <Icon size={14} /> {c.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
