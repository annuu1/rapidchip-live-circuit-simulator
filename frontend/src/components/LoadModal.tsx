import React, { useEffect, useState } from 'react';
import { X, FolderOpen, Trash2, Calendar, Layers } from 'lucide-react';
import { SavedGraphSummary } from '../types';

interface LoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadGraph: (id: string) => Promise<void>;
}

export const LoadModal: React.FC<LoadModalProps> = ({
  isOpen,
  onClose,
  onLoadGraph,
}) => {
  const [graphs, setGraphs] = useState<SavedGraphSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGraphs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/graphs');
      if (!res.ok) throw new Error('Failed to fetch graphs');
      const data = await res.json();
      setGraphs(data);
    } catch (err: any) {
      setError(err.message || 'Error loading circuits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchGraphs();
    }
  }, [isOpen]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this saved circuit?')) return;
    try {
      await fetch(`/api/graphs/${id}`, { method: 'DELETE' });
      setGraphs((prev) => prev.filter((g) => g._id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <FolderOpen className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-100">Load Saved Circuit</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading circuits from database...</div>
          ) : error ? (
            <div className="py-8 text-center text-xs text-rose-400">{error}</div>
          ) : graphs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No saved circuits yet. Build a circuit and hit "Save"!
            </div>
          ) : (
            <div className="space-y-2">
              {graphs.map((g) => (
                <div
                  key={g._id}
                  onClick={async () => {
                    await onLoadGraph(g._id);
                    onClose();
                  }}
                  className="group flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-amber-500/40 cursor-pointer transition-all"
                >
                  <div className="space-y-1">
                    <h3 className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 transition-colors">
                      {g.name}
                    </h3>
                    <div className="flex items-center space-x-3 text-[10px] text-slate-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(g.updatedAt || g.createdAt).toLocaleDateString()}</span>
                      </span>
                      {g.nodeCount !== undefined && (
                        <span className="flex items-center space-x-1">
                          <Layers className="w-3 h-3" />
                          <span>{g.nodeCount} nodes</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleDelete(g._id, e)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete circuit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-slate-950 font-semibold transition-all">
                      Load
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
