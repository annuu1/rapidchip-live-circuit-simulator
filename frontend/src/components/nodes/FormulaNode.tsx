import React from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { Variable } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { CircuitNodeData } from '../../types';

export const FormulaNode: React.FC<NodeProps> = ({ id, data }) => {
  const nodeData = data as CircuitNodeData;
  const { setNodes } = useReactFlow();

  const handleExpressionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const expr = e.target.value;
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              expression: expr,
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
      title="Formula"
      icon={<Variable className="w-4 h-4 text-cyan-400" />}
      data={nodeData}
      colorScheme={{
        border: 'border-cyan-500/30',
        bg: 'bg-cyan-950/40',
        badge: 'text-cyan-400',
      }}
      onDelete={handleDelete}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Expression (uses a, b)</span>
          <span className="font-mono text-[10px] text-cyan-400 font-bold">out</span>
        </div>
        <div className="relative">
          <input
            type="text"
            value={nodeData.expression ?? 'a * 2 + b'}
            onChange={handleExpressionChange}
            className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono text-xs outline-none transition-all"
            placeholder="a * 2 + b"
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
          <span>a: in</span>
          <span>b: in</span>
        </div>
      </div>

      {/* Input Handle A */}
      <Handle
        type="target"
        position={Position.Left}
        id="a"
        style={{ top: '40%' }}
        className="!w-3.5 !h-3.5 !bg-cyan-400 !border-2 !border-slate-900 hover:!scale-125 !transition-transform !cursor-crosshair"
      />

      {/* Input Handle B */}
      <Handle
        type="target"
        position={Position.Left}
        id="b"
        style={{ top: '75%' }}
        className="!w-3.5 !h-3.5 !bg-cyan-400 !border-2 !border-slate-900 hover:!scale-125 !transition-transform !cursor-crosshair"
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{ top: '50%' }}
        className="!w-3.5 !h-3.5 !bg-cyan-400 !border-2 !border-slate-900 hover:!scale-125 !transition-transform !cursor-crosshair"
      />
    </BaseNode>
  );
};
