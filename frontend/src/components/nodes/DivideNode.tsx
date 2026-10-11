import React from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { Divide as DivideIcon } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { CircuitNodeData } from '../../types';

export const DivideNode: React.FC<NodeProps> = ({ id, data }) => {
  const nodeData = data as CircuitNodeData;
  const { setNodes } = useReactFlow();

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
  };

  return (
    <BaseNode
      id={id}
      title="Divide (a ÷ b)"
      icon={<DivideIcon className="w-4 h-4 text-amber-400" />}
      data={nodeData}
      colorScheme={{
        border: 'border-amber-500/30',
        bg: 'bg-amber-950/40',
        badge: 'text-amber-400',
      }}
      onDelete={handleDelete}
    >
      <div className="relative py-2 flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-amber-400/90 font-bold pl-1">in: a (num)</span>
          <span className="text-[10px] text-slate-500 font-mono">quotient</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-amber-400/90 font-bold pl-1">in: b (den)</span>
          <span className="font-mono text-amber-400/90 font-bold pr-1">out</span>
        </div>
      </div>

      {/* Input Handle A (numerator) */}
      <Handle
        type="target"
        position={Position.Left}
        id="a"
        style={{ top: '35%' }}
        className="!w-3.5 !h-3.5 !bg-amber-400 !border-2 !border-slate-900 hover:!scale-125 !transition-transform !cursor-crosshair"
      />

      {/* Input Handle B (denominator) */}
      <Handle
        type="target"
        position={Position.Left}
        id="b"
        style={{ top: '65%' }}
        className="!w-3.5 !h-3.5 !bg-amber-400 !border-2 !border-slate-900 hover:!scale-125 !transition-transform !cursor-crosshair"
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{ top: '50%' }}
        className="!w-3.5 !h-3.5 !bg-amber-400 !border-2 !border-slate-900 hover:!scale-125 !transition-transform !cursor-crosshair"
      />
    </BaseNode>
  );
};
