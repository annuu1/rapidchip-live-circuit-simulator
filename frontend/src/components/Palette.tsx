import React from 'react';
import {
  Hash,
  Plus,
  X as MultiplyIcon,
  Divide as DivideIcon,
  Variable,
  Monitor,
  PlusCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CircuitNodeType } from '../types';

interface PaletteProps {
  onAddNode: (type: CircuitNodeType) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

interface NodeDefinition {
  type: CircuitNodeType;
  title: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
}

const AVAILABLE_NODES: NodeDefinition[] = [
  {
    type: 'number',
    title: 'Number',
    desc: 'Static constant value',
    icon: <Hash className="w-4 h-4 text-sky-400" />,
    color: 'border-sky-500/30 hover:border-sky-500/60 bg-sky-950/20',
  },
  {
    type: 'add',
    title: 'Add',
    desc: 'Sum inputs a + b',
    icon: <Plus className="w-4 h-4 text-emerald-400" />,
    color: 'border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-950/20',
  },
  {
    type: 'multiply',
    title: 'Multiply',
    desc: 'Product inputs a × b',
    icon: <MultiplyIcon className="w-4 h-4 text-purple-400" />,
    color: 'border-purple-500/30 hover:border-purple-500/60 bg-purple-950/20',
  },
  {
    type: 'divide',
    title: 'Divide',
    desc: 'Quotient inputs a ÷ b',
    icon: <DivideIcon className="w-4 h-4 text-amber-400" />,
    color: 'border-amber-500/30 hover:border-amber-500/60 bg-amber-950/20',
  },
  {
    type: 'formula',
    title: 'Formula',
    desc: 'Expression e.g. a*2 + b',
    icon: <Variable className="w-4 h-4 text-cyan-400" />,
    color: 'border-cyan-500/30 hover:border-cyan-500/60 bg-cyan-950/20',
  },
  {
    type: 'display',
    title: 'Display',
    desc: 'Outputs operating voltage',
    icon: <Monitor className="w-4 h-4 text-emerald-400" />,
    color: 'border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-950/20',
  },
];

export const Palette: React.FC<PaletteProps> = ({
  onAddNode,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const onDragStart = (event: React.DragEvent, nodeType: CircuitNodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <>
      {/* Desktop Palette (visible md and up) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900/90 backdrop-blur-md border-r border-slate-800 p-4 z-10 select-none">
        <div className="mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Component Palette</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Drag to canvas or click to insert</p>
        </div>

        <div className="space-y-2.5 overflow-y-auto pr-1">
          {AVAILABLE_NODES.map((node) => (
            <div
              key={node.type}
              draggable
              onDragStart={(e) => onDragStart(e, node.type)}
              onClick={() => onAddNode(node.type)}
              className={`group flex items-center justify-between p-2.5 rounded-xl border ${node.color} cursor-grab active:cursor-grabbing hover:bg-slate-800/80 transition-all duration-150 shadow-sm`}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-700/60 group-hover:scale-105 transition-transform">
                  {node.icon}
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-200">{node.title}</h3>
                  <p className="text-[10px] text-slate-400">{node.desc}</p>
                </div>
              </div>
              <PlusCircle className="w-4 h-4 text-slate-500 group-hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </aside>

      {/* Mobile Drawer / Bottom Bar (visible on < md) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 shadow-2xl transition-all duration-300 select-none">
        <div
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 cursor-pointer border-b border-slate-800/40"
        >
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-200">Component Palette</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-400 text-xs">
            <span>{isMobileOpen ? 'Close' : 'Add Node'}</span>
            {isMobileOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </div>

        {isMobileOpen && (
          <div className="p-3 max-h-56 overflow-y-auto grid grid-cols-2 gap-2">
            {AVAILABLE_NODES.map((node) => (
              <button
                key={node.type}
                onClick={() => {
                  onAddNode(node.type);
                  setIsMobileOpen(false);
                }}
                className={`flex items-center space-x-2.5 p-2 rounded-lg border ${node.color} active:scale-95 transition-transform text-left`}
              >
                <div className="p-1.5 rounded-md bg-slate-900 border border-slate-700/60">
                  {node.icon}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">{node.title}</h4>
                  <p className="text-[9px] text-slate-400 truncate">{node.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
