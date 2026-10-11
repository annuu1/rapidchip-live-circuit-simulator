import { useState, useEffect, useRef, useCallback } from 'react';
import { Edge } from '@xyflow/react';
import { CustomNode, SimulationApiResponse } from '../types';

interface LiveSimulatorState {
  isSimulating: boolean;
  serviceDown: boolean;
  serviceError: string | null;
  lastNetlist: string | null;
  rawOutput: string | null;
}

export function useLiveSimulator(
  nodes: CustomNode[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<CustomNode[]>>
) {
  const [state, setState] = useState<LiveSimulatorState>({
    isSimulating: false,
    serviceDown: false,
    serviceError: null,
    lastNetlist: null,
    rawOutput: null,
  });

  const versionRef = useRef<number>(0);
  const latestProcessedVersionRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<any>(null);

  const runSimulation = useCallback(
    async (currentNodes: CustomNode[], currentEdges: Edge[]) => {
      // Cancel any ongoing network request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const currentVersion = ++versionRef.current;
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setState((prev) => ({ ...prev, isSimulating: true }));

      try {
        const payload = {
          version: currentVersion,
          nodes: currentNodes.map((n) => ({
            id: n.id,
            type: n.type,
            data: {
              value: n.data?.value,
              expression: n.data?.expression,
              label: n.data?.label,
            },
            position: n.position,
          })),
          edges: currentEdges.map((e) => ({
            id: e.id,
            source: e.source,
            sourceHandle: e.sourceHandle,
            target: e.target,
            targetHandle: e.targetHandle,
          })),
        };

        const res = await fetch('/api/simulate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        // If a newer version already finished or started, discard older results
        if (currentVersion < latestProcessedVersionRef.current) {
          return;
        }

        const data: SimulationApiResponse = await res.json();

        // Check if an even newer version finished while parsing
        if (currentVersion < latestProcessedVersionRef.current) {
          return;
        }

        latestProcessedVersionRef.current = currentVersion;

        // Apply results to nodes
        const resultsMap = data.results || {};
        setNodes((nds) =>
          nds.map((node) => {
            const nodeRes = resultsMap[node.id];
            return {
              ...node,
              data: {
                ...node.data,
                result: nodeRes
                  ? {
                      value: nodeRes.value,
                      error: nodeRes.error,
                      blocked: nodeRes.blocked,
                      blockedBy: nodeRes.blockedBy,
                    }
                  : undefined,
              },
            };
          })
        );

        setState({
          isSimulating: false,
          serviceDown: !!data.serviceDown,
          serviceError: data.serviceError || (data.errors && data.errors.length > 0 ? data.errors[0] : null),
          lastNetlist: data.netlist || null,
          rawOutput: data.rawOutput || null,
        });
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // Request was aborted for newer version; ignore
          return;
        }

        console.error('Live simulation request error:', err);
        setState((prev) => ({
          ...prev,
          isSimulating: false,
          serviceDown: true,
          serviceError: 'Unable to connect to Node API or Simulation service',
        }));
      }
    },
    [setNodes]
  );

  // Auto-sync whenever nodes or edges change (with 180ms debounce for rapid keystrokes)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      runSimulation(nodes, edges);
    }, 180);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [nodes, edges, runSimulation]);

  return {
    ...state,
    triggerManualSimulation: () => runSimulation(nodes, edges),
  };
}
