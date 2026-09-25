import { useDFMEAStore } from '../store/dfmeaStore'
import { getModulePresetDiagram } from '../data/modulePresets'

export default function StartChoiceModal() {
  const activeModuleId = useDFMEAStore((s) => s.activeModuleId)
  const activeModuleName = useDFMEAStore(
    (s) => s.modules.find((m) => m.id === s.activeModuleId)?.name ?? ''
  )
  const nodeCount = useDFMEAStore((s) => s.graphsByModule[s.activeModuleId]?.nodes?.length ?? 0)
  const dismissedIds = useDFMEAStore((s) => s.dismissedStartChoiceModuleIds)
  const markStartChoiceDismissed = useDFMEAStore((s) => s.markStartChoiceDismissed)
  const loadPresetDiagram = useDFMEAStore((s) => s.loadPresetDiagram)

  const diagram = getModulePresetDiagram(activeModuleId)
  const shouldShow = Boolean(
    activeModuleId && nodeCount === 0 && diagram && !dismissedIds.includes(activeModuleId)
  )

  if (!shouldShow) return null

  const handleStartBlank = () => {
    markStartChoiceDismissed(activeModuleId)
  }

  const handleLoadPreset = () => {
    loadPresetDiagram()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card start-choice-card">
        <h2>Start {activeModuleName}</h2>
        <p className="start-choice-subtitle">
          How do you want to begin this module&rsquo;s DFMEA graph?
        </p>

        <div className="start-choice-options">
          <button type="button" className="start-choice-option" onClick={handleLoadPreset}>
            <div className="start-choice-option-title">Start from established network</div>
            <div className="start-choice-option-meta">
              {diagram.parts.length} parts · {diagram.interfaces.length} interfaces, pre-wired
              and laid out
            </div>
            <div className="start-choice-option-desc">
              Loads a reference architecture for {activeModuleName.toLowerCase()} so you can
              edit and extend it instead of starting from nothing.
            </div>
          </button>

          <button type="button" className="start-choice-option" onClick={handleStartBlank}>
            <div className="start-choice-option-title">Start blank</div>
            <div className="start-choice-option-meta">Empty canvas</div>
            <div className="start-choice-option-desc">
              Build the graph up yourself, part by part.
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
