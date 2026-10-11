import { Node } from '@xyflow/react';

export type CircuitNodeType = 'number' | 'add' | 'multiply' | 'divide' | 'formula' | 'display';

export interface CircuitNodeData extends Record<string, unknown> {
  value?: number | string;
  expression?: string;
  label?: string;
  result?: {
    value: number | null;
    error: string | null;
    blocked: boolean;
    blockedBy?: string[] | null;
  };
  onChange?: (field: string, val: any) => void;
  [key: string]: unknown;
}

export type CustomNode = Node<CircuitNodeData>;

export interface SimulationResultItem {
  nodeId: string;
  value: number | null;
  error: string | null;
  blocked: boolean;
  blockedBy?: string[] | null;
}

export interface SimulationApiResponse {
  version: number;
  results: Record<string, SimulationResultItem>;
  errors?: string[];
  netlist?: string | null;
  rawOutput?: string | null;
  serviceDown?: boolean;
  serviceError?: string | null;
}

export interface SavedGraphSummary {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  nodeCount?: number;
}
