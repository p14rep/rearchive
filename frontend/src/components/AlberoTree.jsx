import { useState, useMemo } from 'react'

export default function AlberoTree({ albero, selectedItem, onSelectItem, loading, selectedEnte }) {
  const [expanded, setExpanded] = useState({})

  const toggle = (keyProg) => {
    setExpanded((prev) => ({ ...prev, [keyProg]: !prev[keyProg] }))
  }

  const tree = useMemo(() => {
    const map = {}
    const roots = []

    albero.forEach((item, idx) => {
      map[idx] = { ...item, children: [] }
    })

    albero.forEach((item, idx) => {
      if (item.indent === 0) {
        roots.push(map[idx])
      } else {
        for (let i = idx - 1; i >= 0; i--) {
          if (albero[i].indent < item.indent) {
            map[i].children.push(map[idx])
            break
          }
        }
      }
    })

    return roots
  }, [albero])

  const renderItem = (item, idx) => {
    const isExp = expanded[item.keyProg]
    const hasChildren = item.children && item.children.length > 0

    return (
      <div key={`${item.keyProg}-${idx}`}>
        <div
          className={`tree-item ${selectedItem?.keyProg === item.keyProg ? 'active' : ''}`}
          style={{ paddingLeft: `${item.indent * 15}px` }}
        >
          {hasChildren && (
            <span className="toggle" onClick={() => toggle(item.keyProg)}>
              {isExp ? '▼' : '▶'}
            </span>
          )}
          {!hasChildren && <span>📄</span>}
          <span className="label" onClick={() => onSelectItem(item)} title={item.label}>
            {item.label}
          </span>
        </div>
        {hasChildren && isExp && (
          <div>
            {item.children.map((child, i) => renderItem(child, i))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="panel panel-center">
      <h2>🌳 Struttura</h2>
      {loading && <div className="loading">Caricamento...</div>}
      {!loading && tree.length === 0 && (
        <div className="loading">{selectedEnte ? 'Nessun fondo' : 'Seleziona ente'}</div>
      )}
      <div>{tree.map((item, idx) => renderItem(item, idx))}</div>
    </div>
  )
}
