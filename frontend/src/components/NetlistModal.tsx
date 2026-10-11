import React from 'react';
import { X, FileCode, Terminal } from 'lucide-react';

interface NetlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  netlist: string | null;
  rawOutput: string | null;
}

export const NetlistModal: React.FC<NetlistModalProps> = ({
  isOpen,
  onClose,
  netlist,
  rawOutput,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Live SPICE Netlist & ngspice Engine Output</h2>
              <p className="text-[11px] text-slate-400">Automated netlist emitted to batch ngspice</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 mb-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>Generated Netlist (.cir)</span>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre">
              {netlist || 'No netlist currently generated (circuit empty or blocked).'}
            </pre>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 mb-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>ngspice Batch Output (stdout / stderr)</span>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300/90 max-h-56 overflow-y-auto overflow-x-auto whitespace-pre">
              {rawOutput || 'No output recorded.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
