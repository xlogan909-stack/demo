import { useState, useEffect } from 'react'

const WMO = {
  0:  { label: 'Clear Sky',      icon: '☀️' },
  1:  { label: 'Mainly Clear',   icon: '🌤️' },
  2:  { label: 'Partly Cloudy',  icon: '⛅' },
  3:  { label: 'Overcast',       icon: '☁️' },
  45: { label: 'Foggy',          icon: '🌫️' },
  48: { label: 'Icy Fog',        icon: '🌫️' },
  51: { label: 'Light Drizzle',  icon: '🌦️' },
  53: { label: 'Drizzle',        icon: '🌦️' },
  55: { label: 'Heavy Drizzle',  icon: '🌧️' },
  61: { label: 'Light Rain',     icon: '🌧️' },
  63: { label: 'Rain',           icon: '🌧️' },
  65: { label: 'Heavy Rain',     icon: '🌧️' },
  71: { label: 'Light Snow',     icon: '🌨️' },
  73: { label: 'Snow',           icon: '❄️' },
  75: { label: 'Heavy Snow',     icon: '❄️' },
  80: { label: 'Showers',        icon: '🌦️' },
  81: { label: 'Rain Showers',   icon: '🌧️' },
  82: { label: 'Violent Showers',icon: '⛈️' },
  95: { label: 'Thunderstorm',   icon: '⛈️' },
  96: { label: 'Thunderstorm',   icon: '⛈️' },
  99: { label: 'Thunderstorm',   icon: '⛈️' },
}

const getBg = (code) => {
  if (code === 0 || code === 1) return 'from-amber-400 via-orange-300 to-yellow-200'
  if (code <= 3)  return 'from-sky-500 via-blue-400 to-cyan-300'
  if (code <= 48) return 'from-slate-500 via-gray-400 to-slate-300'
  if (code <= 65) return 'from-blue-700 via-blue-500 to-indigo-400'
  if (code <= 75) return 'from-sky-200 via-blue-200 to-indigo-200'
  return 'from-slate-700 via-gray-600 to-slate-500'
}

const FILTERS = ['All', 'Active', 'Completed']

export default function App() {
  const [weather, setWeather] = useState(null)
  const [city, setCity]       = useState(null)
  const [wError, setWError]   = useState(null)
  const [wLoading, setWLoading] = useState(true)

  const [todos, setTodos] = useState([
    { id: 1, text: 'Ship the Vite app to GitHub', done: true },
    { id: 2, text: 'Set up Jenkins pipeline',     done: false },
    { id: 3, text: 'Add weather widget',          done: false },
  ])
  const [input, setInput]   = useState('')
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    if (!navigator.geolocation) { setWError('Geolocation not supported'); setWLoading(false); return }
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lon } }) => {
        try {
          const [wRes, lRes] = await Promise.all([
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`),
            fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`),
          ])
          const wData = await wRes.json()
          const lData = await lRes.json()
          setWeather(wData.current)
          setCity(lData.address?.city || lData.address?.town || lData.address?.village || 'Your Location')
        } catch {
          setWError('Could not load weather')
        } finally {
          setWLoading(false)
        }
      },
      () => { setWError('Location access denied'); setWLoading(false) }
    )
  }, [])

  const addTodo = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    setTodos([...todos, { id: Date.now(), text: input.trim(), done: false }])
    setInput('')
  }
  const toggle  = (id) => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const remove  = (id) => setTodos(todos.filter(t => t.id !== id))
  const clearDone = () => setTodos(todos.filter(t => !t.done))

  const visible   = todos.filter(t => filter === 'Active' ? !t.done : filter === 'Completed' ? t.done : true)
  const remaining = todos.filter(t => !t.done).length

  const code   = weather?.weather_code ?? 0
  const info   = WMO[code] ?? { label: 'Unknown', icon: '🌡️' }
  const bgGrad = getBg(code)

  return (
    <div className={`min-h-screen bg-linear-to-br ${bgGrad} transition-all duration-1000 p-4 flex flex-col items-center`}>

      {/* Weather Card */}
      <div className="w-full max-w-md mt-10 mb-6 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md bg-white/20 border border-white/30 text-white">
        {wLoading ? (
          <div className="flex items-center justify-center py-14 text-white/70 text-sm animate-pulse">
            Fetching weather…
          </div>
        ) : wError ? (
          <div className="flex items-center justify-center py-14 text-white/70 text-sm">{wError}</div>
        ) : (
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-1">{city}</p>
                <div className="flex items-end gap-2">
                  <span className="text-7xl font-thin leading-none">
                    {Math.round(weather.temperature_2m)}°
                  </span>
                  <span className="text-2xl mb-2">C</span>
                </div>
                <p className="text-white/80 text-lg mt-1">{info.label}</p>
              </div>
              <span className="text-7xl drop-shadow-lg">{info.icon}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { label: 'Feels like', value: `${Math.round(weather.apparent_temperature)}°C` },
                { label: 'Humidity',   value: `${weather.relative_humidity_2m}%` },
                { label: 'Wind',       value: `${Math.round(weather.wind_speed_10m)} km/h` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/15 rounded-2xl p-3 text-center backdrop-blur-sm">
                  <p className="text-white/60 text-xs mb-1">{label}</p>
                  <p className="text-white font-semibold text-sm">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Todo Card */}
      <div className="w-full max-w-md rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md bg-white/90 border border-white/50">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">My Tasks</h2>
          <form onSubmit={addTodo} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Add a new task…"
              className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 border border-transparent focus:outline-none focus:ring-2 focus:ring-violet-400 text-gray-700 placeholder-gray-400 text-sm"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all"
            >
              Add
            </button>
          </form>
        </div>

        <ul className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
          {visible.length === 0 ? (
            <li className="py-10 text-center text-gray-400 text-sm">No tasks here!</li>
          ) : visible.map(todo => (
            <li key={todo.id} className="flex items-center gap-3 px-6 py-3.5 group hover:bg-violet-50/50 transition-colors">
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggle(todo.id)}
                className="w-4 h-4 accent-violet-600 cursor-pointer shrink-0"
              />
              <span className={`flex-1 text-sm ${todo.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {todo.text}
              </span>
              <button
                onClick={() => remove(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-base leading-none"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/80 text-xs text-gray-400">
          <span>{remaining} left</span>
          <div className="flex gap-1">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg transition-colors ${filter === f ? 'bg-violet-100 text-violet-700 font-semibold' : 'hover:bg-gray-100'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <button onClick={clearDone} className="hover:text-red-400 transition-colors">Clear done</button>
        </div>
      </div>

      <p className="mt-6 text-white/40 text-xs">Powered by Open-Meteo</p>
    </div>
  )
}
