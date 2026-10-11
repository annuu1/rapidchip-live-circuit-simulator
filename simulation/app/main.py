from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Set, Optional

from app.models import SimulationRequest, SimulationResponse, NodeResult
from app.graph_validator import find_cycles, get_downstream_nodes, validate_formula_expression
from app.netlist import build_netlist, get_node_output_net
from app.ngspice_runner import run_ngspice_batch

app = FastAPI(title="RapidChip Simulation Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "simulation-engine"}

@app.post("/simulate", response_model=SimulationResponse)
async def simulate(req: SimulationRequest):
    nodes = req.nodes
    edges = req.edges
    version = req.version or 0

    results: Dict[str, NodeResult] = {
        n.id: NodeResult(nodeId=n.id) for n in nodes
    }
    errors: List[str] = []

    if not nodes:
        return SimulationResponse(version=version, results={}, errors=[])

    # 1. Detect cycles / loops
    cycle_nodes = find_cycles(nodes, edges)
    if cycle_nodes:
        for cid in cycle_nodes:
            results[cid].error = "Loop detected: node is part of a cyclic dependency"
            errors.append(f"Loop detected involving node {cid}")
        
        # Downstream nodes from the loop are blocked
        cycle_downstream = get_downstream_nodes(cycle_nodes, edges)
        for did in cycle_downstream:
            results[did].blocked = True
            if not results[did].error:
                results[did].error = "Blocked by cycle in upstream node"

    # 2. Check input wiring for each node
    for n in nodes:
        ntype = n.type.lower()
        incoming_handles: Set[str] = set()
        incoming_edges = [e for e in edges if e.target == n.id]
        
        for e in incoming_edges:
            handle = (e.targetHandle or 'in').lower()
            incoming_handles.add(handle)

        if ntype in ('add', 'multiply', 'divide', 'formula'):
            # Must have both 'a' and 'b' wired
            missing = [h for h in ('a', 'b') if h not in incoming_handles]
            if missing:
                if not results[n.id].error:
                    results[n.id].error = f"Missing connection for input(s): {', '.join(missing)}"
                    errors.append(f"Node {n.id} ({ntype}) is missing input(s): {', '.join(missing)}")
                
                # Mark downstream as blocked
                downstream = get_downstream_nodes({n.id}, edges)
                for did in downstream:
                    results[did].blocked = True
                    if not results[did].error:
                        results[did].error = f"Blocked by missing input on upstream node {n.id}"

        elif ntype == 'display':
            if not incoming_edges:
                if not results[n.id].error and not results[n.id].blocked:
                    results[n.id].error = "Display has no input connected"

    # 3. Check formula safety
    has_unsafe_formula = False
    for n in nodes:
        if n.type.lower() == 'formula':
            expr = n.data.get('expression', '') if n.data else ''
            is_safe, err_msg = validate_formula_expression(expr)
            if not is_safe:
                has_unsafe_formula = True
                results[n.id].error = err_msg
                errors.append(f"Formula error in node {n.id}: {err_msg}")
                downstream = get_downstream_nodes({n.id}, edges)
                for did in downstream:
                    results[did].blocked = True
                    if not results[did].error:
                        results[did].error = f"Blocked by invalid formula in upstream node {n.id}"

    # If unsafe formula is detected, reject execution immediately before ngspice
    if has_unsafe_formula:
        return SimulationResponse(
            version=version,
            results=results,
            errors=errors,
            netlist=None,
            rawOutput="Execution blocked due to unsafe formula expression."
        )

    # 4. Check Number node values
    for n in nodes:
        if n.type.lower() == 'number':
            raw_val = n.data.get('value', 0) if n.data else 0
            try:
                val_float = float(raw_val)
                if not results[n.id].error and not results[n.id].blocked:
                    results[n.id].value = val_float
            except (ValueError, TypeError):
                results[n.id].error = f"Invalid number value '{raw_val}'"
                errors.append(f"Invalid number value in node {n.id}")
                downstream = get_downstream_nodes({n.id}, edges)
                for did in downstream:
                    results[did].blocked = True
                    if not results[did].error:
                        results[did].error = f"Blocked by invalid number in upstream node {n.id}"

    # Determine nodes eligible for simulation
    # A node is eligible if it has no error and is not blocked
    active_node_ids = {
        n.id for n in nodes if not results[n.id].error and not results[n.id].blocked
    }

    # If no active nodes have anything to simulate, return now
    if not active_node_ids:
        return SimulationResponse(
            version=version,
            results=results,
            errors=errors,
            netlist=None
        )

    # 5. Build SPICE Netlist
    try:
        netlist_str, node_to_net, display_to_net = build_netlist(
            nodes, edges, active_node_ids=active_node_ids
        )
    except Exception as e:
        return SimulationResponse(
            version=version,
            results=results,
            errors=errors + [f"Netlist generation failed: {str(e)}"],
            netlist=None
        )

    # 6. Execute ngspice batch mode
    try:
        voltages, raw_output = await run_ngspice_batch(netlist_str, timeout=3.5)
    except RuntimeError as re_err:
        # ngspice timeout or failure
        return SimulationResponse(
            version=version,
            results=results,
            errors=errors + [str(re_err)],
            netlist=netlist_str,
            rawOutput=str(re_err)
        )
    except Exception as exc:
        return SimulationResponse(
            version=version,
            results=results,
            errors=errors + [f"Simulation failed: {str(exc)}"],
            netlist=netlist_str,
            rawOutput=str(exc)
        )

    # 7. Post-process voltages and check for Division by Zero
    for n in nodes:
        if n.id not in active_node_ids:
            continue

        ntype = n.type.lower()
        if ntype == 'divide':
            # Check denominator net value
            incoming_b = [e for e in edges if e.target == n.id and (e.targetHandle or '').lower() == 'b']
            if incoming_b:
                src_net = get_node_output_net(incoming_b[0].source).lower()
                b_val = voltages.get(src_net, 0.0)
                if abs(b_val) < 1e-12:
                    results[n.id].error = "Division by zero"
                    results[n.id].value = None
                    errors.append(f"Division by zero in node {n.id}")
                    # Mark all downstream nodes as blocked
                    downstream = get_downstream_nodes({n.id}, edges)
                    for did in downstream:
                        results[did].blocked = True
                        results[did].value = None
                        if not results[did].error:
                            results[did].error = f"Blocked by division by zero in upstream node {n.id}"

    # 8. Assign evaluated values to nodes that are not blocked and have no errors
    for n in nodes:
        if results[n.id].error or results[n.id].blocked:
            results[n.id].value = None
            continue

        ntype = n.type.lower()
        if ntype == 'number':
            raw_val = n.data.get('value', 0) if n.data else 0
            try:
                results[n.id].value = float(raw_val)
            except (ValueError, TypeError):
                results[n.id].value = 0.0
        elif ntype in ('add', 'multiply', 'divide', 'formula'):
            out_net = node_to_net.get(n.id, '').lower()
            if out_net in voltages:
                val = round(voltages[out_net], 6)
                # If round to int matches, clean up float display if needed
                results[n.id].value = int(val) if val.is_integer() else val
        elif ntype == 'display':
            in_net = display_to_net.get(n.id, '').lower()
            if in_net in voltages:
                val = round(voltages[in_net], 6)
                results[n.id].value = int(val) if val.is_integer() else val

    return SimulationResponse(
        version=version,
        results=results,
        errors=errors,
        netlist=netlist_str,
        rawOutput=raw_output
    )
