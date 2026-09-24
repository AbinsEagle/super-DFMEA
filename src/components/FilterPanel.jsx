import { useState } from 'react'
import { useDFMEAStore } from '../store/dfmeaStore'
import { getModuleCategories, INTERFACE_TYPES, getInterfaceTypeColor } from '../data/modulePresets'

export default function FilterPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const activeModuleId = useDFMEAStore((s) => s.activeModuleId)
  const filterCategories = useDFMEAStore((s) => s.filterCategories)
  const filterInterfaceTypes = useDFMEAStore((s) => s.filterInterfaceTypes)
  const toggleCategoryFilter = useDFMEAStore((s) => s.toggleCategoryFilter)
  const toggleInterfaceTypeFilter = useDFMEAStore((s) => s.toggleInterfaceTypeFilter)
  const clearFilters = useDFMEAStore((s) => s.clearFilters)

  const categories = getModuleCategories(activeModuleId)
  const activeCount = filterCategories.length + filterInterfaceTypes.length

  return (
    <div className="filter-panel-wrapper">
      <button
        type="button"
        className="btn btn-secondary toolbar-btn"
        onClick={() => setIsOpen((v) => !v)}
      >
        Filters{activeCount > 0 ? ` (${activeCount})` : ''}
      </button>

      {isOpen ? (
        <>
          <div className="filter-panel-backdrop" onClick={() => setIsOpen(false)} />
          <div className="filter-panel">
            <div className="filter-panel-header">
              <h3>Filters</h3>
              {activeCount > 0 ? (
                <button type="button" className="filter-clear-btn" onClick={clearFilters}>
                  Clear all
                </button>
              ) : null}
            </div>

            <div className="filter-section">
              <div className="filter-section-title">Part Type</div>
              {categories.map((c) => (
                <label key={c} className="filter-checkbox-row">
                  <input
                    type="checkbox"
                    checked={filterCategories.includes(c)}
                    onChange={() => toggleCategoryFilter(c)}
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>

            <div className="filter-section">
              <div className="filter-section-title">Interface Type</div>
              {INTERFACE_TYPES.map((t) => (
                <label key={t} className="filter-checkbox-row">
                  <input
                    type="checkbox"
                    checked={filterInterfaceTypes.includes(t)}
                    onChange={() => toggleInterfaceTypeFilter(t)}
                  />
                  <span
                    className="filter-color-dot"
                    style={{ background: getInterfaceTypeColor(t) }}
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
