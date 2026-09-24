import { useMemo, useState } from 'react'
import { useDFMEAStore } from '../store/dfmeaStore'
import { getModulePresetParts } from '../data/modulePresets'

export default function PresetPartDirectory() {
  const isOpen = useDFMEAStore((s) => s.isPresetDirectoryOpen)
  const activeModuleId = useDFMEAStore((s) => s.activeModuleId)
  const addPart = useDFMEAStore((s) => s.addPart)
  const closePresetDirectory = useDFMEAStore((s) => s.closePresetDirectory)

  const [query, setQuery] = useState('')

  const presetParts = getModulePresetParts(activeModuleId)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return presetParts
    return presetParts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    )
  }, [presetParts, query])

  if (!isOpen) return null

  const handleAddPreset = (preset) => {
    addPart({ name: preset.name, category: preset.category, description: preset.description })
    closePresetDirectory()
  }

  const handleAddCustom = () => {
    addPart()
    closePresetDirectory()
  }

  return (
    <div className="modal-overlay" onClick={closePresetDirectory}>
      <div className="modal-card preset-directory" onClick={(e) => e.stopPropagation()}>
        <h2>Add Part</h2>

        <div className="modal-field">
          <label htmlFor="preset-search">Search preset parts</label>
          <input
            id="preset-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, category, or function…"
            autoFocus
          />
        </div>

        <button type="button" className="btn btn-secondary preset-custom-btn" onClick={handleAddCustom}>
          + Add Custom Part
        </button>

        <div className="preset-list">
          {filtered.length === 0 ? (
            <p className="preset-empty">No preset parts match your search.</p>
          ) : (
            filtered.map((preset) => (
              <button
                key={preset.name}
                type="button"
                className="preset-item"
                onClick={() => handleAddPreset(preset)}
              >
                <div className="preset-item-header">
                  <span className="preset-item-name">{preset.name}</span>
                  <span className="preset-item-category">{preset.category}</span>
                </div>
                <div className="preset-item-desc">{preset.description}</div>
              </button>
            ))
          )}
        </div>

        <div className="modal-actions">
          <div className="modal-actions-right">
            <button type="button" className="btn btn-secondary" onClick={closePresetDirectory}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
