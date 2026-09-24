import { memo } from 'react'
import { Handle, Position } from 'reactflow'

function PartNode({ data, selected }) {
  return (
    <div className={`part-node${selected ? ' selected' : ''}`}>
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />

      <div className="part-node-category">{data.category || 'Part'}</div>
      <div className="part-node-body">
        <div className="part-node-name">{data.name || 'Untitled Part'}</div>
        {data.description ? (
          <div className="part-node-desc">{data.description}</div>
        ) : null}
      </div>
    </div>
  )
}

export default memo(PartNode)
