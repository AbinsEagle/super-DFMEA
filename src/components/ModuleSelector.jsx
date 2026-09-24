import { useState } from 'react'
import { useDFMEAStore } from '../store/dfmeaStore'

export default function ModuleSelector() {
  const modules = useDFMEAStore((s) => s.modules)
  const graphsByModule = useDFMEAStore((s) => s.graphsByModule)
  const setActiveModule = useDFMEAStore((s) => s.setActiveModule)
  const addModule = useDFMEAStore((s) => s.addModule)

  const [isAdding, setIsAdding] = useState(false)
  const [newModuleName, setNewModuleName] = useState('')

  const handleCreateModule = (e) => {
    e.preventDefault()
    const id = addModule(newModuleName)
    if (id) {
      setNewModuleName('')
      setIsAdding(false)
      setActiveModule(id)
    }
  }

  return (
    <div className="module-selector">
      <div className="module-selector-inner">
        <h1>Super DFMEA</h1>
        <p className="module-selector-subtitle">
          Select a product module to build or continue its failure-mode analysis graph.
        </p>

        <div className="module-grid">
          {modules.map((m) => {
            const graph = graphsByModule[m.id]
            const partCount = graph?.nodes?.length ?? 0
            const interfaceCount = graph?.edges?.length ?? 0
            return (
              <button
                key={m.id}
                type="button"
                className="module-card"
                onClick={() => setActiveModule(m.id)}
              >
                <div className="module-card-name">{m.name}</div>
                <div className="module-card-meta">
                  {partCount === 0
                    ? 'No parts yet'
                    : `${partCount} part${partCount === 1 ? '' : 's'} · ${interfaceCount} interface${interfaceCount === 1 ? '' : 's'}`}
                </div>
              </button>
            )
          })}

          {isAdding ? (
            <form className="module-card module-card-new" onSubmit={handleCreateModule}>
              <input
                type="text"
                value={newModuleName}
                onChange={(e) => setNewModuleName(e.target.value)}
                placeholder="Module name…"
                autoFocus
                onBlur={() => {
                  if (!newModuleName.trim()) setIsAdding(false)
                }}
              />
              <div className="module-card-new-actions">
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsAdding(false)
                    setNewModuleName('')
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              className="module-card module-card-add"
              onClick={() => setIsAdding(true)}
            >
              <span className="module-card-add-icon">+</span>
              Add Module
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
