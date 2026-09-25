import { useCallback } from 'react'
import { useDFMEAStore } from '../store/dfmeaStore'
import { getModulePresetDiagram } from '../data/modulePresets'
import FilterPanel from './FilterPanel'

export default function Toolbar() {
  const activeModuleId = useDFMEAStore((s) => s.activeModuleId)
  const nodeCount = useDFMEAStore((s) => s.graphsByModule[s.activeModuleId]?.nodes?.length ?? 0)
  const openPresetDirectory = useDFMEAStore((s) => s.openPresetDirectory)
  const exportGraph = useDFMEAStore((s) => s.exportGraph)
  const loadPresetDiagram = useDFMEAStore((s) => s.loadPresetDiagram)

  const diagram = getModulePresetDiagram(activeModuleId)

  const handleAddPart = useCallback(() => {
    openPresetDirectory()
  }, [openPresetDirectory])

  const handleLoadPreset = useCallback(() => {
    if (nodeCount > 0) {
      const confirmed = window.confirm(
        'This replaces the current parts and interfaces in this module with the established reference diagram. Continue?'
      )
      if (!confirmed) return
    }
    loadPresetDiagram()
  }, [nodeCount, loadPresetDiagram])

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
    <div className="toolbar">
      <FilterPanel />
      {diagram ? (
        <button
          type="button"
          className="btn btn-secondary toolbar-btn"
          onClick={handleLoadPreset}
          title="Load the established reference diagram for this module"
        >
          Load Preset Diagram
        </button>
      ) : null}
      <button
        type="button"
        className="btn btn-secondary toolbar-btn"
        onClick={handleExport}
        title="Export graph as JSON"
      >
        Export JSON
      </button>
      <button
        type="button"
        className="btn btn-primary toolbar-btn"
        onClick={handleAddPart}
        title="Add a new part"
      >
        + Add Part
      </button>
    </div>
  )
}
