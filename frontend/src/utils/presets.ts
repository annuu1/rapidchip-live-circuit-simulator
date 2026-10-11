import { Edge } from '@xyflow/react';
import { CustomNode } from '../types';

export interface PresetGraph {
  id: string;
  title: string;
  description: string;
  expectedResult: string;
  nodes: CustomNode[];
  edges: Edge[];
}

export const PRESET_GRAPHS: PresetGraph[] = [
  {
    id: 'graph-1',
    title: 'Graph 1: Addition',
    description: 'Number 2 and Number 3 → Add → Display',
    expectedResult: 'Display = 5',
    nodes: [
      { id: 'num1', type: 'number', position: { x: 50, y: 50 }, data: { value: 2 } },
      { id: 'num2', type: 'number', position: { x: 50, y: 220 }, data: { value: 3 } },
      { id: 'add1', type: 'add', position: { x: 300, y: 130 }, data: {} },
      { id: 'disp1', type: 'display', position: { x: 550, y: 130 }, data: {} },
    ],
    edges: [
      { id: 'e1', source: 'num1', sourceHandle: 'out', target: 'add1', targetHandle: 'a' },
      { id: 'e2', source: 'num2', sourceHandle: 'out', target: 'add1', targetHandle: 'b' },
      { id: 'e3', source: 'add1', sourceHandle: 'out', target: 'disp1', targetHandle: 'in' },
    ],
  },
  {
    id: 'graph-2',
    title: 'Graph 2: Add then Multiply',
    description: "Graph 1's Add → Multiply with Number 4 → Display",
    expectedResult: 'Display = 20',
    nodes: [
      { id: 'num1', type: 'number', position: { x: 50, y: 50 }, data: { value: 2 } },
      { id: 'num2', type: 'number', position: { x: 50, y: 220 }, data: { value: 3 } },
      { id: 'add1', type: 'add', position: { x: 280, y: 120 }, data: {} },
      { id: 'num3', type: 'number', position: { x: 280, y: 280 }, data: { value: 4 } },
      { id: 'mul1', type: 'multiply', position: { x: 510, y: 180 }, data: {} },
      { id: 'disp1', type: 'display', position: { x: 740, y: 180 }, data: {} },
    ],
    edges: [
      { id: 'e1', source: 'num1', sourceHandle: 'out', target: 'add1', targetHandle: 'a' },
      { id: 'e2', source: 'num2', sourceHandle: 'out', target: 'add1', targetHandle: 'b' },
      { id: 'e3', source: 'add1', sourceHandle: 'out', target: 'mul1', targetHandle: 'a' },
      { id: 'e4', source: 'num3', sourceHandle: 'out', target: 'mul1', targetHandle: 'b' },
      { id: 'e5', source: 'mul1', sourceHandle: 'out', target: 'disp1', targetHandle: 'in' },
    ],
  },
  {
    id: 'graph-3',
    title: 'Graph 3: Single Source Multiply',
    description: 'One Number 7 wired into both inputs of Multiply',
    expectedResult: 'Display = 49',
    nodes: [
      { id: 'num1', type: 'number', position: { x: 80, y: 140 }, data: { value: 7 } },
      { id: 'mul1', type: 'multiply', position: { x: 330, y: 140 }, data: {} },
      { id: 'disp1', type: 'display', position: { x: 580, y: 140 }, data: {} },
    ],
    edges: [
      { id: 'e1', source: 'num1', sourceHandle: 'out', target: 'mul1', targetHandle: 'a' },
      { id: 'e2', source: 'num1', sourceHandle: 'out', target: 'mul1', targetHandle: 'b' },
      { id: 'e3', source: 'mul1', sourceHandle: 'out', target: 'disp1', targetHandle: 'in' },
    ],
  },
  {
    id: 'graph-4',
    title: 'Graph 4: Division by Zero',
    description: 'Number 10 ÷ Number 0 → Display',
    expectedResult: 'Divide shows error; Display shows blocked, not old value',
    nodes: [
      { id: 'num1', type: 'number', position: { x: 50, y: 50 }, data: { value: 10 } },
      { id: 'num2', type: 'number', position: { x: 50, y: 220 }, data: { value: 0 } },
      { id: 'div1', type: 'divide', position: { x: 300, y: 130 }, data: {} },
      { id: 'disp1', type: 'display', position: { x: 550, y: 130 }, data: {} },
    ],
    edges: [
      { id: 'e1', source: 'num1', sourceHandle: 'out', target: 'div1', targetHandle: 'a' },
      { id: 'e2', source: 'num2', sourceHandle: 'out', target: 'div1', targetHandle: 'b' },
      { id: 'e3', source: 'div1', sourceHandle: 'out', target: 'disp1', targetHandle: 'in' },
    ],
  },
  {
    id: 'graph-5',
    title: 'Graph 5: Unwired Input',
    description: 'Add with only one input wired',
    expectedResult: 'That Add node is highlighted with missing connection error',
    nodes: [
      { id: 'num1', type: 'number', position: { x: 60, y: 100 }, data: { value: 5 } },
      { id: 'add1', type: 'add', position: { x: 300, y: 120 }, data: {} },
      { id: 'disp1', type: 'display', position: { x: 540, y: 120 }, data: {} },
    ],
    edges: [
      { id: 'e1', source: 'num1', sourceHandle: 'out', target: 'add1', targetHandle: 'a' },
      { id: 'e2', source: 'add1', sourceHandle: 'out', target: 'disp1', targetHandle: 'in' },
    ],
  },
  {
    id: 'graph-6',
    title: 'Graph 6: Cyclic Dependency',
    description: 'Add → Multiply → back into the same Add',
    expectedResult: 'Loop is flagged on the nodes involved; downstream blocked',
    nodes: [
      { id: 'num1', type: 'number', position: { x: 40, y: 80 }, data: { value: 2 } },
      { id: 'add1', type: 'add', position: { x: 260, y: 120 }, data: {} },
      { id: 'mul1', type: 'multiply', position: { x: 500, y: 120 }, data: {} },
      { id: 'disp1', type: 'display', position: { x: 740, y: 120 }, data: {} },
    ],
    edges: [
      { id: 'e1', source: 'num1', sourceHandle: 'out', target: 'add1', targetHandle: 'a' },
      { id: 'e2', source: 'add1', sourceHandle: 'out', target: 'mul1', targetHandle: 'a' },
      { id: 'e3', source: 'num1', sourceHandle: 'out', target: 'mul1', targetHandle: 'b' },
      { id: 'e4', source: 'mul1', sourceHandle: 'out', target: 'add1', targetHandle: 'b' },
      { id: 'e5', source: 'mul1', sourceHandle: 'out', target: 'disp1', targetHandle: 'in' },
    ],
  },
  {
    id: 'graph-7',
    title: 'Graph 7: Formula Node',
    description: 'Formula a * 2 + b with a = 3, b = 4 → Display',
    expectedResult: 'Display = 10',
    nodes: [
      { id: 'num1', type: 'number', position: { x: 50, y: 50 }, data: { value: 3 } },
      { id: 'num2', type: 'number', position: { x: 50, y: 220 }, data: { value: 4 } },
      { id: 'form1', type: 'formula', position: { x: 300, y: 130 }, data: { expression: 'a * 2 + b' } },
      { id: 'disp1', type: 'display', position: { x: 560, y: 130 }, data: {} },
    ],
    edges: [
      { id: 'e1', source: 'num1', sourceHandle: 'out', target: 'form1', targetHandle: 'a' },
      { id: 'e2', source: 'num2', sourceHandle: 'out', target: 'form1', targetHandle: 'b' },
      { id: 'e3', source: 'form1', sourceHandle: 'out', target: 'disp1', targetHandle: 'in' },
    ],
  },
  {
    id: 'graph-8',
    title: 'Graph 8: Malicious Formula Injection',
    description: 'Formula a + b with newline and .control shell ls',
    expectedResult: 'Rejected with a clear message; nothing executes',
    nodes: [
      { id: 'num1', type: 'number', position: { x: 50, y: 50 }, data: { value: 1 } },
      { id: 'num2', type: 'number', position: { x: 50, y: 220 }, data: { value: 2 } },
      {
        id: 'form1',
        type: 'formula',
        position: { x: 300, y: 130 },
        data: { expression: 'a + b\n.control\nshell ls' },
      },
      { id: 'disp1', type: 'display', position: { x: 560, y: 130 }, data: {} },
    ],
    edges: [
      { id: 'e1', source: 'num1', sourceHandle: 'out', target: 'form1', targetHandle: 'a' },
      { id: 'e2', source: 'num2', sourceHandle: 'out', target: 'form1', targetHandle: 'b' },
      { id: 'e3', source: 'form1', sourceHandle: 'out', target: 'disp1', targetHandle: 'in' },
    ],
  },
];
