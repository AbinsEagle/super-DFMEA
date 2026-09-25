import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval'
import { applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow'
import { DEFAULT_MODULES, getModulePresetDiagram } from '../data/modulePresets'

// Adapts idb-keyval's get/set/del to the { getItem, setItem, removeItem }
// shape zustand's persist middleware expects, so state survives refresh
// via IndexedDB instead of localStorage.
const indexedDBStorage = {
  getItem: async (name) => (await idbGet(name)) ?? null,
  setItem: async (name, value) => idbSet(name, value),
  removeItem: async (name) => idbDel(name),
}

let idCounter = 0
const genId = (prefix) => {
  idCounter += 1
  return `${prefix}_${Date.now()}_${idCounter}`
}

const slugify = (name) =>
  `${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${genId('mod')}`

const emptyGraph = () => ({ nodes: [], edges: [] })

export const useDFMEAStore = create(
  persist(
    (set, get) => ({
      // --- Modules ---
      modules: DEFAULT_MODULES,
      activeModuleId: null,
      graphsByModule: Object.fromEntries(DEFAULT_MODULES.map((m) => [m.id, emptyGraph()])),

      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      setActiveModule: (moduleId) => {
        set({
          activeModuleId: moduleId,
          selectedNodeId: null,
          selectedEdgeId: null,
          filterCategories: [],
          filterInterfaceTypes: [],
        })
      },
      addModule: (name) => {
        const trimmed = name.trim()
        if (!trimmed) return null
        const id = slugify(trimmed)
        set({
          modules: [...get().modules, { id, name: trimmed }],
          graphsByModule: { ...get().graphsByModule, [id]: emptyGraph() },
        })
        return id
      },

      // --- Start-choice ("blank" vs "established network"), shown once per
      // module the first time its graph is empty. ---
      dismissedStartChoiceModuleIds: [],
      markStartChoiceDismissed: (moduleId) => {
        const current = get().dismissedStartChoiceModuleIds
        if (current.includes(moduleId)) return
        set({ dismissedStartChoiceModuleIds: [...current, moduleId] })
      },
      loadPresetDiagram: () => {
        const { activeModuleId } = get()
        const diagram = getModulePresetDiagram(activeModuleId)
        if (!diagram) return
        const nameToId = {}
        const nodes = diagram.parts.map((p) => {
          const id = genId('part')
          nameToId[p.name] = id
          return {
            id,
            type: 'partNode',
            position: { x: p.x, y: p.y },
            data: { name: p.name, category: p.category, description: p.description },
          }
        })
        const edges = diagram.interfaces
          .map((i) => {
            const source = nameToId[i.source]
            const target = nameToId[i.target]
            if (!source || !target) return null
            return {
              id: genId('interface'),
              source,
              target,
              type: 'default',
              label: i.interfaceType,
              data: { interfaceType: i.interfaceType, description: i.description ?? '' },
            }
          })
          .filter(Boolean)
        get()._updateActiveGraph(() => ({ nodes, edges }))
        get().markStartChoiceDismissed(activeModuleId)
      },

      // --- Internal helper: scoped read/write of the active module's graph ---
      _activeGraph: () => {
        const { activeModuleId, graphsByModule } = get()
        return graphsByModule[activeModuleId] ?? emptyGraph()
      },
      _updateActiveGraph: (updater) => {
        const { activeModuleId, graphsByModule } = get()
        if (!activeModuleId) return
        const current = graphsByModule[activeModuleId] ?? emptyGraph()
        set({
          graphsByModule: {
            ...graphsByModule,
            [activeModuleId]: { ...current, ...updater(current) },
          },
        })
      },

      selectedNodeId: null,
      selectedEdgeId: null,
      isPresetDirectoryOpen: false,
      openPresetDirectory: () => set({ isPresetDirectoryOpen: true }),
      closePresetDirectory: () => set({ isPresetDirectoryOpen: false }),

      // --- Filters (part category / interface type). Empty array = no
      // restriction, i.e. everything shown at full opacity. ---
      filterCategories: [],
      filterInterfaceTypes: [],
      toggleCategoryFilter: (category) => {
        const current = get().filterCategories
        set({
          filterCategories: current.includes(category)
            ? current.filter((c) => c !== category)
            : [...current, category],
        })
      },
      toggleInterfaceTypeFilter: (interfaceType) => {
        const current = get().filterInterfaceTypes
        set({
          filterInterfaceTypes: current.includes(interfaceType)
            ? current.filter((t) => t !== interfaceType)
            : [...current, interfaceType],
        })
      },
      clearFilters: () => set({ filterCategories: [], filterInterfaceTypes: [] }),

      // --- React Flow wiring ---
      onNodesChange: (changes) => {
        get()._updateActiveGraph((g) => ({ nodes: applyNodeChanges(changes, g.nodes) }))
      },
      onEdgesChange: (changes) => {
        get()._updateActiveGraph((g) => ({ edges: applyEdgeChanges(changes, g.edges) }))
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
        get()._updateActiveGraph((g) => ({ edges: addEdge(newEdge, g.edges) }))
      },

      // --- Parts (nodes) CRUD ---
      addPart: (overrides = {}, position) => {
        const id = genId('part')
        const { nodes: existingNodes } = get()._activeGraph()
        // Lay new parts out on a loose grid (with a little jitter) instead
        // of pure random placement, which reliably overlapped since the
        // random range was smaller than the part card's own width.
        const index = existingNodes.length
        const columns = 4
        const cellWidth = 260
        const cellHeight = 200
        const jitter = () => (Math.random() - 0.5) * 30
        const newNode = {
          id,
          type: 'partNode',
          position: position ?? {
            x: 80 + (index % columns) * cellWidth + jitter(),
            y: 80 + Math.floor(index / columns) * cellHeight + jitter(),
          },
          data: {
            name: 'New Part',
            category: 'Other',
            description: '',
            ...overrides,
          },
        }
        get()._updateActiveGraph((g) => ({ nodes: [...g.nodes, newNode] }))
        return id
      },
      updatePart: (id, data) => {
        get()._updateActiveGraph((g) => ({
          nodes: g.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)),
        }))
      },
      deletePart: (id) => {
        get()._updateActiveGraph((g) => ({
          nodes: g.nodes.filter((n) => n.id !== id),
          edges: g.edges.filter((e) => e.source !== id && e.target !== id),
        }))
        set({ selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId })
      },

      // --- Interfaces (edges) CRUD ---
      updateInterface: (id, data) => {
        get()._updateActiveGraph((g) => ({
          edges: g.edges.map((e) =>
            e.id === id
              ? { ...e, label: data.interfaceType ?? e.data?.interfaceType, data: { ...e.data, ...data } }
              : e
          ),
        }))
      },
      deleteInterface: (id) => {
        get()._updateActiveGraph((g) => ({ edges: g.edges.filter((e) => e.id !== id) }))
        set({ selectedEdgeId: get().selectedEdgeId === id ? null : get().selectedEdgeId })
      },

      // --- Selection / modal state ---
      setSelectedNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
      setSelectedEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),
      clearSelection: () => set({ selectedNodeId: null, selectedEdgeId: null }),

      // --- Import / Export ---
      exportGraph: () => {
        const { activeModuleId, modules } = get()
        const moduleName = modules.find((m) => m.id === activeModuleId)?.name ?? activeModuleId
        const { nodes, edges } = get()._activeGraph()
        return { module: moduleName, nodes, edges, exportedAt: new Date().toISOString() }
      },
      importGraph: ({ nodes, edges }) => {
        get()._updateActiveGraph(() => ({ nodes: nodes ?? [], edges: edges ?? [] }))
      },
      clearGraph: () => {
        get()._updateActiveGraph(() => emptyGraph())
        set({ selectedNodeId: null, selectedEdgeId: null })
      },
    }),
    {
      name: 'super-dfmea-graph',
      storage: createJSONStorage(() => indexedDBStorage),
      partialize: (state) => ({
        modules: state.modules,
        graphsByModule: state.graphsByModule,
        activeModuleId: state.activeModuleId,
        dismissedStartChoiceModuleIds: state.dismissedStartChoiceModuleIds,
      }),
      // Default merge is a shallow `{...current, ...persisted}`, which would
      // let a browser's old cached `modules` list (saved before a new
      // built-in module existed in code) permanently hide that new module.
      // Union by id instead, so newly added DEFAULT_MODULES always show up
      // for returning users while their custom modules and graphs are kept.
      merge: (persistedState, currentState) => {
        const persisted = persistedState ?? {}
        const persistedModules = persisted.modules ?? []
        const mergedModules = [...persistedModules]
        for (const defaultModule of DEFAULT_MODULES) {
          if (!mergedModules.some((m) => m.id === defaultModule.id)) {
            mergedModules.push(defaultModule)
          }
        }
        const mergedGraphsByModule = { ...(persisted.graphsByModule ?? {}) }
        for (const m of mergedModules) {
          if (!mergedGraphsByModule[m.id]) {
            mergedGraphsByModule[m.id] = emptyGraph()
          }
        }
        return {
          ...currentState,
          ...persisted,
          modules: mergedModules,
          graphsByModule: mergedGraphsByModule,
        }
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
