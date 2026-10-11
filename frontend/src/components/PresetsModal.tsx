import React from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import { PRESET_GRAPHS, PresetGraph } from '../utils/presets';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetGraph) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Review Acceptance Graphs</h2>
              <p className="text-[11px] text-slate-400">Load test circuits 1–8 from the take-home specification</p>
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
        <div className="p-4 overflow-y-auto space-y-2.5 divide-y divide-slate-800/40">
          {PRESET_GRAPHS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => {
                onSelectPreset(preset);
                onClose();
              }}
              className="pt-2.5 first:pt-0 group flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 cursor-pointer transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
                    {preset.title}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{preset.description}</p>
                <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Expected: {preset.expectedResult}</span>
                </div>
              </div>

              <div className="mt-2 sm:mt-0 sm:ml-4 shrink-0">
                <button className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  Load Graph
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
