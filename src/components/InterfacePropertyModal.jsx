import { useEffect, useState } from 'react'
import { useDFMEAStore, INTERFACE_TYPES } from '../store/dfmeaStore'

export default function InterfacePropertyModal() {
  const selectedEdgeId = useDFMEAStore((s) => s.selectedEdgeId)
  const edges = useDFMEAStore((s) => s.edges)
  const nodes = useDFMEAStore((s) => s.nodes)
  const updateInterface = useDFMEAStore((s) => s.updateInterface)
  const deleteInterface = useDFMEAStore((s) => s.deleteInterface)
  const clearSelection = useDFMEAStore((s) => s.clearSelection)

  const edge = edges.find((e) => e.id === selectedEdgeId)

  const [interfaceType, setInterfaceType] = useState('Electrical')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (edge) {
      setInterfaceType(edge.data?.interfaceType ?? 'Electrical')
      setDescription(edge.data?.description ?? '')
    }
  }, [edge])

  if (!edge) return null

  const sourceName = nodes.find((n) => n.id === edge.source)?.data?.name ?? edge.source
  const targetName = nodes.find((n) => n.id === edge.target)?.data?.name ?? edge.target

  const handleSave = () => {
    updateInterface(edge.id, { interfaceType, description })
    clearSelection()
  }

  const handleDelete = () => {
    deleteInterface(edge.id)
  }

  return (
    <div className="modal-overlay" onClick={clearSelection}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Interface</h2>
        <p style={{ margin: '-8px 0 16px', fontSize: 12, color: '#667085' }}>
          {sourceName} → {targetName}
        </p>

        <div className="modal-field">
          <label htmlFor="interface-type">Interface Type</label>
          <select
            id="interface-type"
            value={interfaceType}
            onChange={(e) => setInterfaceType(e.target.value)}
          >
            {INTERFACE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-field">
          <label htmlFor="interface-description">Description</label>
          <textarea
            id="interface-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="How do these parts interact?"
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-danger" onClick={handleDelete}>
            Delete Interface
          </button>
          <div className="modal-actions-right">
            <button type="button" className="btn btn-secondary" onClick={clearSelection}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
