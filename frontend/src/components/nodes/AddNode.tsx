import React from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { Plus } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { CircuitNodeData } from '../../types';

export const AddNode: React.FC<NodeProps> = ({ id, data }) => {
  const nodeData = data as CircuitNodeData;
  const { setNodes } = useReactFlow();

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
  };

  return (
    <BaseNode
      id={id}
      title="Add (a + b)"
      icon={<Plus className="w-4 h-4 text-emerald-400" />}
      data={nodeData}
      colorScheme={{
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-950/40',
        badge: 'text-emerald-400',
      }}
      onDelete={handleDelete}
    >
      <div className="relative py-2 flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-emerald-400/90 font-bold pl-1">in: a</span>
          <span className="text-[10px] text-slate-500 font-mono">sum</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-emerald-400/90 font-bold pl-1">in: b</span>
          <span className="font-mono text-emerald-400/90 font-bold pr-1">out</span>
        </div>
      </div>

      {/* Input Handle A */}
      <Handle
        type="target"
        position={Position.Left}
        id="a"
        style={{ top: '35%' }}
        className="!w-3.5 !h-3.5 !bg-emerald-400 !border-2 !border-slate-900 hover:!scale-125 !transition-transform !cursor-crosshair"
      />

      {/* Input Handle B */}
      <Handle
        type="target"
        position={Position.Left}
        id="b"
        style={{ top: '65%' }}
        className="!w-3.5 !h-3.5 !bg-emerald-400 !border-2 !border-slate-900 hover:!scale-125 !transition-transform !cursor-crosshair"
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{ top: '50%' }}
        className="!w-3.5 !h-3.5 !bg-emerald-400 !border-2 !border-slate-900 hover:!scale-125 !transition-transform !cursor-crosshair"
      />
    </BaseNode>
  );
};
