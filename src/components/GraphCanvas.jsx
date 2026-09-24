import { useCallback, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useDFMEAStore } from '../store/dfmeaStore'
import PartNode from './PartNode'

export default function GraphCanvas() {
  const nodes = useDFMEAStore((s) => s.graphsByModule[s.activeModuleId]?.nodes ?? [])
  const edges = useDFMEAStore((s) => s.graphsByModule[s.activeModuleId]?.edges ?? [])
  const onNodesChange = useDFMEAStore((s) => s.onNodesChange)
  const onEdgesChange = useDFMEAStore((s) => s.onEdgesChange)
  const onConnect = useDFMEAStore((s) => s.onConnect)
  const setSelectedNode = useDFMEAStore((s) => s.setSelectedNode)
  const setSelectedEdge = useDFMEAStore((s) => s.setSelectedEdge)
  const clearSelection = useDFMEAStore((s) => s.clearSelection)

  const nodeTypes = useMemo(() => ({ partNode: PartNode }), [])

  const handleNodeClick = useCallback(
    (_event, node) => setSelectedNode(node.id),
    [setSelectedNode]
  )

  const handleEdgeClick = useCallback(
    (_event, edge) => setSelectedEdge(edge.id),
    [setSelectedEdge]
  )

  const handlePaneClick = useCallback(() => clearSelection(), [clearSelection])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={handleNodeClick}
      onEdgeClick={handleEdgeClick}
      onPaneClick={handlePaneClick}
      nodeTypes={nodeTypes}
      fitView
      minZoom={0.2}
      maxZoom={2}
      deleteKeyCode={['Backspace', 'Delete']}
    >
      <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#c9d3dc" />
      <Controls />
      <MiniMap
        nodeColor={() => '#0f3d63'}
        maskColor="rgba(15, 61, 99, 0.06)"
        pannable
        zoomable
      />
    </ReactFlow>
  )
}
