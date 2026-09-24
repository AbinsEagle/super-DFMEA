import { useCallback, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useDFMEAStore } from '../store/dfmeaStore'
import { getInterfaceTypeColor } from '../data/modulePresets'
import PartNode from './PartNode'

const SELECTED_EDGE_COLOR = '#0f3d63'

export default function GraphCanvas() {
  const nodes = useDFMEAStore((s) => s.graphsByModule[s.activeModuleId]?.nodes ?? [])
  const edges = useDFMEAStore((s) => s.graphsByModule[s.activeModuleId]?.edges ?? [])
  const filterCategories = useDFMEAStore((s) => s.filterCategories)
  const filterInterfaceTypes = useDFMEAStore((s) => s.filterInterfaceTypes)
  const selectedNodeId = useDFMEAStore((s) => s.selectedNodeId)
  const selectedEdgeId = useDFMEAStore((s) => s.selectedEdgeId)
  const onNodesChange = useDFMEAStore((s) => s.onNodesChange)
  const onEdgesChange = useDFMEAStore((s) => s.onEdgesChange)
  const onConnect = useDFMEAStore((s) => s.onConnect)
  const setSelectedNode = useDFMEAStore((s) => s.setSelectedNode)
  const setSelectedEdge = useDFMEAStore((s) => s.setSelectedEdge)
  const clearSelection = useDFMEAStore((s) => s.clearSelection)

  const nodeTypes = useMemo(() => ({ partNode: PartNode }), [])

  // Part-category filter dims non-matching nodes rather than removing them,
  // so edges never end up pointing at a node that's no longer in the array.
  const dimmedNodeIds = useMemo(() => {
    if (filterCategories.length === 0) return new Set()
    return new Set(
      nodes.filter((n) => !filterCategories.includes(n.data.category)).map((n) => n.id)
    )
  }, [nodes, filterCategories])

  const styledNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        selected: n.id === selectedNodeId,
        className: dimmedNodeIds.has(n.id) ? 'node-dimmed' : undefined,
      })),
    [nodes, dimmedNodeIds, selectedNodeId]
  )

  const styledEdges = useMemo(
    () =>
      edges.map((e) => {
        const interfaceType = e.data?.interfaceType
        const isSelected = e.id === selectedEdgeId
        const failsTypeFilter =
          filterInterfaceTypes.length > 0 && !filterInterfaceTypes.includes(interfaceType)
        const touchesDimmedNode = dimmedNodeIds.has(e.source) || dimmedNodeIds.has(e.target)
        const dimmed = failsTypeFilter || touchesDimmedNode
        return {
          ...e,
          className: dimmed ? 'edge-dimmed' : undefined,
          style: {
            stroke: isSelected ? SELECTED_EDGE_COLOR : getInterfaceTypeColor(interfaceType),
            strokeWidth: isSelected ? 3 : 2,
          },
        }
      }),
    [edges, filterInterfaceTypes, dimmedNodeIds, selectedEdgeId]
  )

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
      nodes={styledNodes}
      edges={styledEdges}
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
      <Controls position="bottom-left" />
      <MiniMap
        position="bottom-right"
        nodeColor={(n) => (dimmedNodeIds.has(n.id) ? '#cbd5e1' : '#0f3d63')}
        maskColor="rgba(15, 61, 99, 0.06)"
        pannable
        zoomable
      />
    </ReactFlow>
  )
}
