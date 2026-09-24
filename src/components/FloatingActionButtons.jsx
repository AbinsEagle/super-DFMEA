import { useCallback } from 'react'
import { useDFMEAStore } from '../store/dfmeaStore'

export default function FloatingActionButtons() {
  const openPresetDirectory = useDFMEAStore((s) => s.openPresetDirectory)
  const exportGraph = useDFMEAStore((s) => s.exportGraph)

  const handleAddPart = useCallback(() => {
    openPresetDirectory()
  }, [openPresetDirectory])

  const handleExport = useCallback(() => {
    const graph = exportGraph()
    const blob = new Blob([JSON.stringify(graph, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dfmea-graph-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }, [exportGraph])

  return (
    <div className="fab-container">
      <button
        type="button"
        className="fab-button fab-secondary"
        onClick={handleExport}
        title="Export graph as JSON"
      >
        <span className="fab-icon">⬇</span>
        Export JSON
      </button>
      <button
        type="button"
        className="fab-button fab-primary"
        onClick={handleAddPart}
        title="Add a new part"
      >
        <span className="fab-icon">+</span>
        Add Part
      </button>
    </div>
  )
}
