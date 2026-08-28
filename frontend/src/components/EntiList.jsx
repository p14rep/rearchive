import { useState, useMemo } from 'react'

export default function EntiList({ enti, selectedEnte, onSelectEnte, loading, error }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return enti
    return enti.filter(e => e.label.toLowerCase().includes(search.toLowerCase()))
  }, [enti, search])

  return (
    <div className="panel panel-left">
      <h2>📚 Enti</h2>
      {error && <div className="error">{error}</div>}
      <input
        type="text"
        className="search"
        placeholder="Cerca..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading && <div className="loading">Caricamento...</div>}
      {!loading && filtered.length === 0 && <div className="loading">Nessun ente</div>}
      <ul className="list">
        {filtered.map((ente) => (
          <li
            key={ente.enteKey}
            className={selectedEnte === ente.enteKey ? 'active' : ''}
            onClick={() => onSelectEnte(ente.enteKey)}
            title={ente.label}
          >
            {ente.label}
          </li>
        ))}
      </ul>
      <div className="loading" style={{ marginTop: '20px' }}>
        {filtered.length} enti
      </div>
    </div>
  )
}
