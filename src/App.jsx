import { ReactFlowProvider } from 'reactflow'
import { useDFMEAStore } from './store/dfmeaStore'
import ModuleSelector from './components/ModuleSelector'
import GraphCanvas from './components/GraphCanvas'
import FloatingActionButtons from './components/FloatingActionButtons'
import PartPropertyModal from './components/PartPropertyModal'
import InterfacePropertyModal from './components/InterfacePropertyModal'
import PresetPartDirectory from './components/PresetPartDirectory'

export default function App() {
  const hasHydrated = useDFMEAStore((s) => s.hasHydrated)
  const activeModuleId = useDFMEAStore((s) => s.activeModuleId)
  const activeModuleName = useDFMEAStore(
    (s) => s.modules.find((m) => m.id === s.activeModuleId)?.name ?? ''
  )
  const partCount = useDFMEAStore((s) => s.graphsByModule[s.activeModuleId]?.nodes?.length ?? 0)
  const interfaceCount = useDFMEAStore((s) => s.graphsByModule[s.activeModuleId]?.edges?.length ?? 0)
  const setActiveModule = useDFMEAStore((s) => s.setActiveModule)

  if (!hasHydrated) {
    return (
      <div className="app-shell">
        <div className="loading-screen">Loading saved data…</div>
      </div>
    )
  }

  if (!activeModuleId) {
    return <ModuleSelector />
  }

  return (
    <div className="app-shell">
      <div className="app-header">
        <div className="app-header-left">
          <button
            type="button"
            className="btn btn-secondary change-module-btn"
            onClick={() => setActiveModule(null)}
          >
            ← Modules
          </button>
          <h1>{activeModuleName}</h1>
        </div>
        <span className="save-status">
          {partCount} parts · {interfaceCount} interfaces · auto-saved
        </span>
      </div>

      <ReactFlowProvider>
        <div className="canvas-wrapper">
          <GraphCanvas />
        </div>
        <FloatingActionButtons />
        <PartPropertyModal />
        <InterfacePropertyModal />
        <PresetPartDirectory />
      </ReactFlowProvider>
    </div>
  )
}
