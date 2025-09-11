import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

const useDiagramStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    nodes: [],
    connections: [],
    selectedNodeId: null,
    canvasOffset: { x: 0, y: 0 },
    zoom: 1,
    
    // Actions
    addNode: (node) => set((state) => ({
      nodes: [...state.nodes, { ...node, id: Date.now().toString() }]
    })),
    
    updateNode: (id, updates) => set((state) => ({
      nodes: state.nodes.map(node => 
        node.id === id ? { ...node, ...updates } : node
      )
    })),
    
    deleteNode: (id) => set((state) => ({
      nodes: state.nodes.filter(node => node.id !== id),
      connections: state.connections.filter(
        conn => conn.from !== id && conn.to !== id
      ),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId
    })),
    
    selectNode: (id) => set({ selectedNodeId: id }),
    
    addConnection: (connection) => set((state) => ({
      connections: [...state.connections, { ...connection, id: Date.now().toString() }]
    })),
    
    setCanvasOffset: (offset) => set({ canvasOffset: offset }),
    setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(3, zoom)) }),
    
    clearDiagram: () => set({
      nodes: [],
      connections: [],
      selectedNodeId: null
    }),
    
    loadDiagram: (diagram) => set({
      nodes: diagram.nodes || [],
      connections: diagram.connections || [],
      selectedNodeId: null
    })
  }))
);

export default useDiagramStore;