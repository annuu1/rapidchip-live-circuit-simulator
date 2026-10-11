import React, { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  Connection,
  Edge,
  useReactFlow,
} from '@xyflow/react';
import { Header } from './components/Header';
import { Palette } from './components/Palette';
import { PresetsModal } from './components/PresetsModal';
import { NetlistModal } from './components/NetlistModal';
import { SaveModal } from './components/SaveModal';
import { LoadModal } from './components/LoadModal';
import { NumberNode } from './components/nodes/NumberNode';
import { AddNode } from './components/nodes/AddNode';
import { MultiplyNode } from './components/nodes/MultiplyNode';
import { DivideNode } from './components/nodes/DivideNode';
import { FormulaNode } from './components/nodes/FormulaNode';
import { DisplayNode } from './components/nodes/DisplayNode';
import { useLiveSimulator } from './hooks/useLiveSimulator';
import { PRESET_GRAPHS, PresetGraph } from './utils/presets';
import { CircuitNodeType, CustomNode } from './types';
import { AlertTriangle } from 'lucide-react';

const nodeTypes = {
  number: NumberNode,
  add: AddNode,
  multiply: MultiplyNode,
  divide: DivideNode,
  formula: FormulaNode,
  display: DisplayNode,
};

function CircuitCanvas() {
  // Initialize with Acceptance Graph 1 by default
  const defaultPreset = PRESET_GRAPHS[0];
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>(defaultPreset.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultPreset.edges);
  const [activeGraphName, setActiveGraphName] = useState(defaultPreset.title);

  // Modals state
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [netlistOpen, setNetlistOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);

  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Live simulation synchronization hook
  const {
    isSimulating,
    serviceDown,
    serviceError,
    lastNetlist,
    rawOutput,
  } = useLiveSimulator(nodes, edges, setNodes);

  // Connection validation rule (PDF Step 2):
  // "Connect an output to an input. One output can feed many inputs, but each input accepts only one wire.
  //  Block connections that make no sense, such as input to input or a node wired to itself."
  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      // 1. Block wiring to itself
      if (connection.source === connection.target) {
        return false;
      }

      // 2. Each input handle accepts ONLY ONE wire
      const alreadyHasWire = edges.some(
        (e) =>
          e.target === connection.target &&
          e.targetHandle === connection.targetHandle
      );
      if (alreadyHasWire) {
        return false;
      }

      return true;
    },
    [edges]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (isValidConnection(params)) {
        setEdges((eds) =>
          addEdge(
            {
              ...params,
              animated: true,
              style: { stroke: '#38bdf8', strokeWidth: 2.5 },
            },
            eds
          )
        );
      }
    },
    [isValidConnection, setEdges]
  );

  // Node creation helper
  const createNewNode = useCallback(
    (type: CircuitNodeType, pos?: { x: number; y: number }): CustomNode => {
      const id = `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      let initialData: any = {};
      if (type === 'number') initialData.value = 5;
      if (type === 'formula') initialData.expression = 'a * 2 + b';

      return {
        id,
        type,
        position: pos || {
          x: 250 + (Math.random() - 0.5) * 60,
          y: 180 + (Math.random() - 0.5) * 60,
        },
        data: initialData,
      };
    },
    []
  );

  // Add node from Palette click or tap (centered on screen)
  const handleAddNode = useCallback(
    (type: CircuitNodeType) => {
      let position = { x: 250, y: 180 };
      if (reactFlowWrapper.current && reactFlowInstance) {
        const bounds = reactFlowWrapper.current.getBoundingClientRect();
        const center = {
          x: bounds.width / 2 + (Math.random() - 0.5) * 60,
          y: bounds.height / 2 + (Math.random() - 0.5) * 60,
        };
        position = reactFlowInstance.screenToFlowPosition(center);
      }
      const newNode = createNewNode(type, position);
      setNodes((nds) => [...nds, newNode]);
    },
    [createNewNode, reactFlowInstance, setNodes]
  );

  // Desktop Drag & Drop handler
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow') as CircuitNodeType;
      if (!type) return;

      if (reactFlowWrapper.current && reactFlowInstance) {
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        const newNode = createNewNode(type, position);
        setNodes((nds) => [...nds, newNode]);
      }
    },
    [createNewNode, reactFlowInstance, setNodes]
  );

  // Acceptance Presets selection
  const handleSelectPreset = useCallback(
    (preset: PresetGraph) => {
      setNodes(preset.nodes);
      setEdges(preset.edges);
      setActiveGraphName(preset.title);
      setTimeout(() => {
        reactFlowInstance?.fitView({ padding: 0.2, duration: 400 });
      }, 50);
    },
    [reactFlowInstance, setEdges, setNodes]
  );

  // Clear Canvas
  const handleClearCanvas = useCallback(() => {
    if (confirm('Clear the canvas?')) {
      setNodes([]);
      setEdges([]);
      setActiveGraphName('Blank Circuit');
    }
  }, [setEdges, setNodes]);

  // Save to MongoDB
  const handleSaveCircuit = useCallback(
    async (name: string) => {
      try {
        const res = await fetch('/api/graphs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            nodes,
            edges,
          }),
        });
        if (res.ok) {
          setActiveGraphName(name);
          return true;
        }
        return false;
      } catch (err) {
        console.error('Error saving graph:', err);
        return false;
      }
    },
    [nodes, edges]
  );

  // Load from MongoDB
  const handleLoadCircuit = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/graphs/${id}`);
        if (!res.ok) throw new Error('Failed to load circuit');
        const data = await res.json();
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        setActiveGraphName(data.name || 'Saved Circuit');
        setTimeout(() => {
          reactFlowInstance?.fitView({ padding: 0.2, duration: 400 });
        }, 50);
      } catch (err) {
        console.error('Error loading circuit:', err);
      }
    },
    [reactFlowInstance, setEdges, setNodes]
  );

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950">
      {/* Top Navigation */}
      <Header
        isSimulating={isSimulating}
        serviceDown={serviceDown}
        serviceError={serviceError}
        onOpenPresets={() => setPresetsOpen(true)}
        onSaveGraph={() => setSaveOpen(true)}
        onOpenLoadModal={() => setLoadOpen(true)}
        onClearCanvas={handleClearCanvas}
        onToggleNetlist={() => setNetlistOpen(true)}
        activeGraphName={activeGraphName}
      />

      {/* Backend Alert Banner if ngspice service is down */}
      {serviceDown && (
        <div className="bg-rose-950/90 border-b border-rose-800/80 px-4 py-2 flex items-center justify-between text-xs text-rose-200 z-10">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Simulation Offline:</strong> {serviceError || 'ngspice simulation backend service is unreachable. Canvas remains fully editable; live sync will automatically resume when service reconnects.'}
            </span>
          </div>
        </div>
      )}

      {/* Main Workspace: Palette + Canvas */}
      <div className="flex flex-1 relative overflow-hidden" ref={reactFlowWrapper}>
        <Palette
          onAddNode={handleAddNode}
          isMobileOpen={mobilePaletteOpen}
          setIsMobileOpen={setMobilePaletteOpen}
        />

        <div className="flex-1 h-full w-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            nodeTypes={nodeTypes}
            onDragOver={onDragOver}
            onDrop={onDrop}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.2}
            maxZoom={2.5}
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: '#38bdf8', strokeWidth: 2.5 },
            }}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="#1e293b" />
            <Controls className="!bottom-16 md:!bottom-4 !left-4" showInteractive={false} />
            <MiniMap
              className="!hidden lg:!block !bottom-4 !right-4 !bg-slate-900/90 !border !border-slate-800 rounded-xl"
              nodeColor={(n) => {
                if (n.type === 'number') return '#38bdf8';
                if (n.type === 'add') return '#10b981';
                if (n.type === 'multiply') return '#c084fc';
                if (n.type === 'divide') return '#f59e0b';
                if (n.type === 'formula') return '#06b6d4';
                return '#34d399';
              }}
              maskColor="rgba(15, 23, 42, 0.7)"
            />
          </ReactFlow>
        </div>
      </div>

      {/* Modals */}
      <PresetsModal
        isOpen={presetsOpen}
        onClose={() => setPresetsOpen(false)}
        onSelectPreset={handleSelectPreset}
      />

      <NetlistModal
        isOpen={netlistOpen}
        onClose={() => setNetlistOpen(false)}
        netlist={lastNetlist}
        rawOutput={rawOutput}
      />

      <SaveModal
        isOpen={saveOpen}
        onClose={() => setSaveOpen(false)}
        onSave={handleSaveCircuit}
        initialName={activeGraphName}
      />

      <LoadModal
        isOpen={loadOpen}
        onClose={() => setLoadOpen(false)}
        onLoadGraph={handleLoadCircuit}
      />
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <CircuitCanvas />
    </ReactFlowProvider>
  );
}
