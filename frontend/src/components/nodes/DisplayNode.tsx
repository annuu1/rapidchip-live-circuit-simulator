import React from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { Monitor } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { CircuitNodeData } from '../../types';

export const DisplayNode: React.FC<NodeProps> = ({ id, data }) => {
  const nodeData = data as CircuitNodeData;
  const { setNodes } = useReactFlow();

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
  };

  const result = nodeData.result;
  const hasValue = result?.value !== undefined && result?.value !== null && !result?.error && !result?.blocked;

  return (
    <BaseNode
      id={id}
      title="Display"
      icon={<Monitor className="w-4 h-4 text-emerald-400" />}
      data={nodeData}
      colorScheme={{
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-950/40',
        badge: 'text-emerald-400',
      }}
      onDelete={handleDelete}
    >
      <div className="py-2">
        <div className="rounded-lg bg-slate-950/90 border border-slate-800 p-3 shadow-inner text-center font-mono">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">OUTPUT VOLTAGE</div>
          {hasValue ? (
            <div className="text-2xl font-bold text-emerald-400 tracking-tight">
              {result.value}
            </div>
          ) : result?.blocked ? (
            <div className="text-sm font-semibold text-amber-400 animate-pulse">
              [BLOCKED]
            </div>
          ) : result?.error ? (
            <div className="text-xs font-semibold text-rose-400">
              [ERROR]
            </div>
          ) : (
            <div className="text-lg text-slate-600 font-medium">--</div>
          )}
        </div>
      </div>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{ top: '50%' }}
        className="!w-3.5 !h-3.5 !bg-emerald-400 !border-2 !border-slate-900 hover:!scale-125 !transition-transform !cursor-crosshair"
      />
    </BaseNode>
  );
};
