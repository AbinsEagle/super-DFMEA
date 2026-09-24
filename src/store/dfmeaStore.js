import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval'
import { applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow'

// Adapts idb-keyval's get/set/del to the { getItem, setItem, removeItem }
// shape zustand's persist middleware expects, so state survives refresh
// via IndexedDB instead of localStorage.
const indexedDBStorage = {
  getItem: async (name) => (await idbGet(name)) ?? null,
  setItem: async (name, value) => idbSet(name, value),
  removeItem: async (name) => idbDel(name),
}

export const PART_CATEGORIES = [
  'Heating Element',
  'Tank',
  'Sensor',
  'Controller',
  'Wiring',
  'Enclosure',
  'Valve',
  'Other',
]

export const INTERFACE_TYPES = [
  'Electrical',
  'Thermal',
  'Mechanical',
  'Fluid',
  'Data/Signal',
  'Other',
]

let idCounter = 0
const genId = (prefix) => {
  idCounter += 1
  return `${prefix}_${Date.now()}_${idCounter}`
}

const initialNodes = []
const initialEdges = []

export const useDFMEAStore = create(
  persist(
    (set, get) => ({
      nodes: initialNodes,
      edges: initialEdges,

      selectedNodeId: null,
      selectedEdgeId: null,

      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      // --- React Flow wiring ---
      onNodesChange: (changes) => {
        set({ nodes: applyNodeChanges(changes, get().nodes) })
      },
      onEdgesChange: (changes) => {
        set({ edges: applyEdgeChanges(changes, get().edges) })
      },
      onConnect: (connection) => {
        const newEdge = {
          ...connection,
          id: genId('interface'),
          type: 'default',
          label: 'New Interface',
          data: {
            interfaceType: 'Electrical',
            description: '',
          },
        }
        set({ edges: addEdge(newEdge, get().edges) })
      },

      // --- Parts (nodes) CRUD ---
      addPart: (position) => {
        const id = genId('part')
        const newNode = {
          id,
          type: 'partNode',
          position: position ?? {
            x: 120 + Math.random() * 300,
            y: 120 + Math.random() * 300,
          },
          data: {
            name: 'New Part',
            category: 'Other',
            description: '',
          },
        }
        set({ nodes: [...get().nodes, newNode] })
        return id
      },
      updatePart: (id, data) => {
        set({
          nodes: get().nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...data } } : n
          ),
        })
      },
      deletePart: (id) => {
        set({
          nodes: get().nodes.filter((n) => n.id !== id),
          edges: get().edges.filter((e) => e.source !== id && e.target !== id),
          selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
        })
      },

      // --- Interfaces (edges) CRUD ---
      updateInterface: (id, data) => {
        set({
          edges: get().edges.map((e) =>
            e.id === id
              ? {
                  ...e,
                  label: data.interfaceType ?? e.data?.interfaceType,
                  data: { ...e.data, ...data },
                }
              : e
          ),
        })
      },
      deleteInterface: (id) => {
        set({
          edges: get().edges.filter((e) => e.id !== id),
          selectedEdgeId: get().selectedEdgeId === id ? null : get().selectedEdgeId,
        })
      },

      // --- Selection / modal state ---
      setSelectedNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
      setSelectedEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),
      clearSelection: () => set({ selectedNodeId: null, selectedEdgeId: null }),

      // --- Import / Export ---
      exportGraph: () => {
        const { nodes, edges } = get()
        return { nodes, edges, exportedAt: new Date().toISOString() }
      },
      importGraph: ({ nodes, edges }) => {
        set({ nodes: nodes ?? [], edges: edges ?? [] })
      },
      clearGraph: () => set({ nodes: [], edges: [], selectedNodeId: null, selectedEdgeId: null }),
    }),
    {
      name: 'super-dfmea-graph',
      storage: createJSONStorage(() => indexedDBStorage),
      partialize: (state) => ({ nodes: state.nodes, edges: state.edges }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
