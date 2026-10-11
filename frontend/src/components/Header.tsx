import React, { useState } from 'react';
import {
  Save,
  FolderOpen,
  RotateCcw,
  Sparkles,
  FileCode,
  Activity,
  AlertTriangle,
  Menu,
  X,
} from 'lucide-react';

interface HeaderProps {
  isSimulating: boolean;
  serviceDown: boolean;
  serviceError: string | null;
  onOpenPresets: () => void;
  onSaveGraph: () => void;
  onOpenLoadModal: () => void;
  onClearCanvas: () => void;
  onToggleNetlist: () => void;
  activeGraphName: string;
}

export const Header: React.FC<HeaderProps> = ({
  isSimulating,
  serviceDown,
  serviceError,
  onOpenPresets,
  onSaveGraph,
  onOpenLoadModal,
  onClearCanvas,
  onToggleNetlist,
  activeGraphName,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="relative z-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3 py-2.5 sm:px-4 flex items-center justify-between select-none">
      {/* Brand & Circuit Title */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
            ⚡
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold tracking-tight text-slate-100 hidden sm:inline">RapidChip</h1>
              <span className="text-xs px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">ngspice</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate max-w-[130px] sm:max-w-[200px]">
              {activeGraphName || 'Live Canvas'}
            </p>
          </div>
        </div>

        {/* Live Status Indicator */}
        <div className="flex items-center">
          {serviceDown ? (
            <div className="flex items-center space-x-1.5 px-2 py-1 rounded-full bg-rose-950/80 border border-rose-800 text-[11px] text-rose-300">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Offline</span>
            </div>
          ) : isSimulating ? (
            <div className="flex items-center space-x-1.5 px-2 py-1 rounded-full bg-sky-950/80 border border-sky-800 text-[11px] text-sky-300">
              <Activity className="w-3.5 h-3.5 text-sky-400 animate-spin" />
              <span className="hidden sm:inline">Simulating...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 px-2 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-[11px] text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Live Synced</span>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Actions */}
      <div className="hidden md:flex items-center space-x-2">
        <button
          onClick={onOpenPresets}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Acceptance Presets</span>
        </button>

        <button
          onClick={onToggleNetlist}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
          title="View SPICE Netlist"
        >
          <FileCode className="w-3.5 h-3.5 text-cyan-400" />
          <span>Netlist</span>
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        <button
          onClick={onSaveGraph}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
        >
          <Save className="w-3.5 h-3.5 text-emerald-400" />
          <span>Save</span>
        </button>

        <button
          onClick={onOpenLoadModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Load</span>
        </button>

        <button
          onClick={onClearCanvas}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs font-medium transition-colors"
          title="Clear Canvas"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Mobile Menu Toggle */}
      <div className="flex md:hidden items-center space-x-1.5">
        <button
          onClick={onOpenPresets}
          className="px-2.5 py-1.5 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full right-2 mt-1 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 space-y-1">
          <button
            onClick={() => {
              onToggleNetlist();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-left text-xs text-slate-200"
          >
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span>View Netlist</span>
          </button>
          <button
            onClick={() => {
              onSaveGraph();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-left text-xs text-slate-200"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Save Circuit</span>
          </button>
          <button
            onClick={() => {
              onOpenLoadModal();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-left text-xs text-slate-200"
          >
            <FolderOpen className="w-4 h-4 text-amber-400" />
            <span>Load Circuit</span>
          </button>
          <button
            onClick={() => {
              onClearCanvas();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-rose-500/20 text-left text-xs text-rose-400"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Canvas</span>
          </button>
        </div>
      )}
    </header>
  );
};
