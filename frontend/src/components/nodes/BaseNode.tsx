import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { CircuitNodeData } from '../../types';

interface BaseNodeProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  data: CircuitNodeData;
  colorScheme: {
    border: string;
    bg: string;
    badge: string;
  };
  children: React.ReactNode;
  onDelete?: () => void;
}

export const BaseNode: React.FC<BaseNodeProps> = ({
  id,
  title,
  icon,
  data,
  colorScheme,
  children,
  onDelete,
}) => {
  const result = data.result;
  const hasError = !!result?.error;
  const isBlocked = !!result?.blocked;
  const hasValue = result?.value !== undefined && result?.value !== null && !hasError && !isBlocked;

  let statusBorder = colorScheme.border;
  let statusGlow = '';

  if (hasError) {
    statusBorder = 'border-rose-500 shadow-rose-500/20';
    statusGlow = 'ring-2 ring-rose-500/30';
  } else if (isBlocked) {
    statusBorder = 'border-amber-500 shadow-amber-500/20';
    statusGlow = 'ring-2 ring-amber-500/30';
  } else if (hasValue) {
    statusBorder = 'border-emerald-500/70';
  }

  return (
    <div
      className={`min-w-[190px] max-w-[240px] rounded-xl border bg-slate-900/95 backdrop-blur-md shadow-xl transition-all duration-200 select-none ${statusBorder} ${statusGlow}`}
    >
      {/* Node Header */}
      <div className={`flex items-center justify-between px-3 py-2 border-b border-slate-800 ${colorScheme.bg} rounded-t-xl`}>
        <div className="flex items-center space-x-2">
          <span className="text-slate-300">{icon}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">{title}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          {hasValue && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-950 text-emerald-400 border border-emerald-800">
              = {result.value}
            </span>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded transition-colors"
              title="Delete node"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Node Body */}
      <div className="p-3 text-sm">{children}</div>

      {/* Node Status Banner */}
      {hasError && (
        <div className="px-3 py-1.5 bg-rose-950/80 border-t border-rose-900/60 rounded-b-xl flex items-start space-x-1.5 text-[11px] text-rose-300">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-rose-400" />
          <span className="break-words leading-tight">{result?.error}</span>
        </div>
      )}

      {!hasError && isBlocked && (
        <div className="px-3 py-1.5 bg-amber-950/80 border-t border-amber-900/60 rounded-b-xl flex items-start space-x-1.5 text-[11px] text-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" />
          <span className="break-words leading-tight">{result?.error || 'Blocked by upstream node'}</span>
        </div>
      )}
    </div>
  );
};
