import React from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { Hash } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { CircuitNodeData } from '../../types';

export const NumberNode: React.FC<NodeProps> = ({ id, data }) => {
  const nodeData = data as CircuitNodeData;
  const { setNodes } = useReactFlow();

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const num = raw === '' ? '' : (isNaN(Number(raw)) ? raw : Number(raw));
    
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              value: num,
            },
          };
        }
        return node;
      })
    );
  };

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
  };

  return (
    <BaseNode
      id={id}
      title="Number"
      icon={<Hash className="w-4 h-4 text-sky-400" />}
      data={nodeData}
      colorScheme={{
        border: 'border-sky-500/30',
        bg: 'bg-sky-950/40',
        badge: 'text-sky-400',
      }}
      onDelete={handleDelete}
    >
      <div className="space-y-2">
        <label className="text-[11px] font-medium text-slate-400">Value</label>
        <div className="relative">
          <input
            type="number"
            step="any"
            value={nodeData.value ?? 0}
            onChange={handleValueChange}
            className="w-full bg-slate-950/80 border border-slate-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg px-3 py-1.5 text-slate-100 font-mono text-sm outline-none transition-all"
            placeholder="0"
          />
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className="!w-3.5 !h-3.5 !bg-sky-400 !border-2 !border-slate-900 hover:!scale-125 !transition-transform !cursor-crosshair"
      />
    </BaseNode>
  );
};
