# RapidChip: Live Node Graph Engine & Circuit Simulator

A browser-based live circuit and node editor powered by **React Flow (`@xyflow/react`)**, **Node.js + Express API**, **Python + FastAPI**, and **ngspice batch mode (`ngspice -b`)**, with persistence in **MongoDB**.

---

## Architecture Overview

```
+-------------------------------------------------------------+
|                  Frontend (React + Vite)                    |
|           React Flow (@xyflow/react) + Tailwind CSS         |
|   - Mobile-Responsive Canvas & Touch Palette                |
|   - Fast edits debouncing & version sequencing              |
+------------------------------+------------------------------+
                               | (HTTP / REST)
                               v
+-------------------------------------------------------------+
|                     API (Node.js + Express)                 |
|   - Reverse proxy / Simulation orchestrator                 |
|   - Fault tolerance & offline state handling                |
|   - Graph persistence (CRUD)                                |
+------------------+-----------------------+------------------+
                   |                       |
       (Mongoose)  v                       v (HTTP / REST)
+----------------------+     +--------------------------------+
|  Database (MongoDB)  |     |  Simulation Service (FastAPI)  |
|  - Saved circuits    |     |  - Cycle & validation engine   |
|  - Auto-timestamps   |     |  - Netlist generator           |
|  - In-mem fallback   |     |  - Untrusted formula filter    |
+----------------------+     +---------------+----------------+
                                             |
                               (Subprocess)  v
                             +--------------------------------+
                             |    ngspice -b (Batch Mode)     |
                             |    DC Operating Point (.op)    |
                             +--------------------------------+
```

---

## How to Run

### 1. Run Everything via Docker Compose (Recommended)

From a clean clone:

```bash
docker compose up --build
```

- **Frontend**: http://localhost:3000
- **Node API**: http://localhost:5000
- **FastAPI Simulation Service**: http://localhost:8000
- **MongoDB**: mongodb://localhost:27017/circuits

### 2. Run Locally (Development)

**Simulation Service (Python):**
```bash
# Requires ngspice installed: e.g. apt install ngspice or brew install ngspice
cd simulation
pip install -r requirements.txt pytest-asyncio
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**API (Node.js):**
```bash
cd api
npm install
npm start
```

**Frontend (React):**
```bash
cd frontend
npm install
npm run dev
```

---

## Automated Tests

Run the test suite covering all 8 acceptance graphs, loop detection, and unsafe formula rejection:

```bash
# Run Python simulation & acceptance tests
PYTHONPATH=simulation pytest simulation/tests/test_acceptance.py -v

# Run Node API integration tests
npm --prefix api test
```

---

## Graph-to-Netlist & Loop Detection

### 1. Net Naming & Wire Mapping
Every node with an output (`Number`, `Add`, `Multiply`, `Divide`, `Formula`) owns an output net: `n_<id>`. Wires connect source output nets to target input handles (`a`, `b`, `in`).

- **Number**: `V<id> n_<id> 0 DC <value>`
- **Add**: `B<id> n_<id> 0 V = V(<a>) + V(<b>)`
- **Multiply**: `B<id> n_<id> 0 V = V(<a>) * V(<b>)`
- **Divide**: `B<id> n_<id> 0 V = V(<a>) / V(<b>)`
- **Formula**: `B<id> n_<id> 0 V = <translated_expression>` (where word boundaries map `a` &rarr; `V(<a>)` and `b` &rarr; `V(<b>)`)
- **Display**: Reads `V(<in>)` from the `.op` analysis table.

The netlist ends with `.op` and `.end`, executes with `ngspice -b <file>`, and parses DC node voltages from the operating point output table.

### 2. Loop & Dependency Detection
A directed adjacency graph is constructed from active wires. Depth-first search (DFS) with 3-color marking detects cycles (back-edges). Any node participating in a cycle is flagged with `Loop detected: node is part of a cyclic dependency`. Downstream nodes reachable from cyclic nodes are automatically marked `blocked: true` and display `[BLOCKED]` rather than stale results.

---

## Step 5 Answers

### 1. Fast edits
Input changes are debounced client-side (180ms) to prevent flooding the backend. Each simulation request carries a strictly monotonic version counter; the frontend immediately cancels previous in-flight requests using `AbortController` and discards any response whose version is older than the latest processed version, preventing out-of-order state corruption.

### 2. Errors on the right node
Topological pre-simulation analyzes loops (marking cyclic nodes) and unwired ports (marking missing input nodes). For division by zero, the evaluator checks if the divisor net evaluates to 0 and flags the specific Divide node. Downstream reachability marks all dependents as blocked (`value: null`), preventing stale or confusing values.

### 3. ngspice misbehaves
FastAPI executes `ngspice -b` as an asynchronous subprocess with a strict 3.5s timeout (`asyncio.wait_for`), killing rogue processes on timeout. The Node API sets an `AbortSignal` timeout and returns a structured degraded response (`serviceDown: true`). The React UI surfaces a non-blocking offline banner while canvas editing, wiring, saving, and loading continue uninterrupted, auto-recovering when the service responds.

### 4. Untrusted formulas
Formula expressions undergo strict character and token whitelisting: only numbers, variables `a` and `b`, operators (`+`, `-`, `*`, `/`), and parentheses `()` are allowed. Any newlines (`\n`), semicolons, control sequences (`.control`), shell commands, or unauthorized symbols cause immediate pre-execution rejection. The expression is never sent to ngspice.

### Known Edge Case That Still Breaks
**Extreme Floating-Point Overflow Cascades:** Chaining multiple Multiply or Formula power nodes with large inputs (e.g. $10^{50} \times 10^{50}$) can exceed IEEE 754 float limits in ngspice, triggering an internal matrix singular convergence failure rather than a clean math domain exception.

---

## Mobile Responsiveness & UX

- **Responsive Viewport & Gestures:** Full touch support on phones and tablets with pinch-to-zoom, panning, and enlarged touch handle hitboxes for accurate wiring.
- **Collapsible Component Palette:** Desktop sidebar collapses into a touch-friendly bottom drawer on mobile with tap-to-center node placement.
- **Interactive Acceptance Presets:** Built-in modal loads all 8 test circuits in one click for instant verification.
- **Live Netlist Inspector:** Modal displays the exact generated SPICE `.cir` netlist and raw ngspice stdout/stderr.

---

## What I'd Do Next

1. **Additional Node Types:**
   - `Subtract (a - b)` and `Power (a ^ b)`
   - `Comparator (a > b ? 1 : 0)` and `Mux (select, in1, in2)`
   - `Integrator / Capacitor` and `Derivative / Inductor` for analog dynamics
2. **AC & Transient Analysis:** Oscilloscope node displaying real-time time-domain voltage waveforms.
3. **Subcircuit Packaging (Hierarchical Chips):** Select a group of nodes and collapse them into a single reusable custom chip component.
4. **Undo / Redo & Undo History Stack:** Full state time-travel for canvas operations.

---

## AI Usage Note

Antigravity AI was used to assist in project scaffolding, generating ngspice `.op` table parser regex, verifying the 8 acceptance test cases in `pytest-asyncio`, and writing responsive CSS for touch devices. All system design, SPICE mapping rules, and error recovery architectures were tailored directly to the take-home specification.
