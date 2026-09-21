import { ReactFlowProvider } from 'reactflow'
import { useDFMEAStore } from './store/dfmeaStore'
import GraphCanvas from './components/GraphCanvas'
import FloatingActionButtons from './components/FloatingActionButtons'
import PartPropertyModal from './components/PartPropertyModal'
import InterfacePropertyModal from './components/InterfacePropertyModal'

export default function App() {
  const hasHydrated = useDFMEAStore((s) => s.hasHydrated)
  const partCount = useDFMEAStore((s) => s.nodes.length)
  const interfaceCount = useDFMEAStore((s) => s.edges.length)

  return (
    <div className="app-shell">
      <div className="app-header">
        <h1>Super DFMEA — Graph Editor</h1>
        <span className="save-status">
          {hasHydrated
            ? `${partCount} parts · ${interfaceCount} interfaces · auto-saved`
            : 'Loading saved graph…'}
        </span>
      </div>

      <ReactFlowProvider>
        <div className="canvas-wrapper">
          <GraphCanvas />
        </div>
        <FloatingActionButtons />
        <PartPropertyModal />
        <InterfacePropertyModal />
      </ReactFlowProvider>
    </div>
  )
}
