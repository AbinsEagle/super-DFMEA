import { useEffect, useState } from 'react'
import { useDFMEAStore, PART_CATEGORIES } from '../store/dfmeaStore'

export default function PartPropertyModal() {
  const selectedNodeId = useDFMEAStore((s) => s.selectedNodeId)
  const nodes = useDFMEAStore((s) => s.nodes)
  const updatePart = useDFMEAStore((s) => s.updatePart)
  const deletePart = useDFMEAStore((s) => s.deletePart)
  const clearSelection = useDFMEAStore((s) => s.clearSelection)

  const node = nodes.find((n) => n.id === selectedNodeId)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('Other')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (node) {
      setName(node.data.name ?? '')
      setCategory(node.data.category ?? 'Other')
      setDescription(node.data.description ?? '')
    }
  }, [node])

  if (!node) return null

  const handleSave = () => {
    updatePart(node.id, { name: name.trim() || 'Untitled Part', category, description })
    clearSelection()
  }

  const handleDelete = () => {
    deletePart(node.id)
  }

  return (
    <div className="modal-overlay" onClick={clearSelection}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Part</h2>

        <div className="modal-field">
          <label htmlFor="part-name">Part Name</label>
          <input
            id="part-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="modal-field">
          <label htmlFor="part-category">Category</label>
          <select
            id="part-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {PART_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-field">
          <label htmlFor="part-description">Description / Function</label>
          <textarea
            id="part-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this part do?"
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-danger" onClick={handleDelete}>
            Delete Part
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
