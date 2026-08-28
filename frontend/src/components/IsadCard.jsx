export default function IsadCard({ data, selectedItem, loading, error }) {
  if (!selectedItem) {
    return (
      <div className="panel panel-right">
        <div className="loading" style={{ paddingTop: '60px' }}>
          👆 Seleziona un elemento
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="panel panel-right">
        <div className="loading">Caricamento scheda...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="panel panel-right">
        <div className="error">{error}</div>
      </div>
    )
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="panel panel-right">
        <h2>{selectedItem.label}</h2>
        <div className="loading">Nessun dato</div>
      </div>
    )
  }

  const formatKey = (key) => {
    return key
      .replace(/_/g, ' ')
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }

  return (
    <div className="panel panel-right">
      <h2>{selectedItem.label}</h2>
      <table className="table">
        <tbody>
          {Object.entries(data).map(([key, value]) => (
            <tr key={key}>
              <th>{formatKey(key)}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
