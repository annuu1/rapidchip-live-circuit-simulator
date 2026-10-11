import re
from typing import Dict, List, Tuple, Optional
from app.models import GraphNode, GraphEdge

def sanitize_spice_id(raw_id: str) -> str:
    """
    Sanitizes a node ID to be valid in SPICE element and node names.
    Replaces non-alphanumeric chars with underscores.
    """
    cleaned = re.sub(r'[^a-zA-Z0-9_]', '_', str(raw_id))
    if not cleaned:
        cleaned = "1"
    return cleaned

def get_node_output_net(node_id: str) -> str:
    """
    Returns the SPICE net name representing the output of node_id.
    """
    sanitized = sanitize_spice_id(node_id)
    return f"n_{sanitized}"

def build_netlist(
    nodes: List[GraphNode],
    edges: List[GraphEdge],
    active_node_ids: Optional[set] = None
) -> Tuple[str, Dict[str, str], Dict[str, str]]:
    """
    Constructs the SPICE netlist from the graph according to the prompt spec:
    - Number: V<id> <out> 0 DC <value>
    - Add: B<id> <out> 0 V = V(<a>) + V(<b>)
    - Multiply: B<id> <out> 0 V = V(<a>) * V(<b>)
    - Divide: B<id> <out> 0 V = V(<a>) / V(<b>)
    - Formula: B<id> <out> 0 V = <safe_expr>
    - Display: no line; read V(<in>) from the result

    Returns:
    (netlist_string, node_to_output_net, display_to_input_net)
    """
    if active_node_ids is None:
        active_node_ids = {n.id for n in nodes}

    # Map edges to target inputs: target_node_id -> { 'a': source_net, 'b': source_net, 'in': source_net }
    node_inputs: Dict[str, Dict[str, str]] = {n.id: {} for n in nodes}
    for e in edges:
        if e.source not in active_node_ids or e.target not in active_node_ids:
            continue
        src_net = get_node_output_net(e.source)
        handle = (e.targetHandle or 'in').lower()
        if handle in ('in', 'x'):
            node_inputs[e.target]['in'] = src_net
        elif handle in ('a', 'b'):
            node_inputs[e.target][handle] = src_net
        else:
            # Fallback if handle wasn't specified
            if 'a' not in node_inputs[e.target]:
                node_inputs[e.target]['a'] = src_net
            else:
                node_inputs[e.target]['b'] = src_net

    node_to_output_net: Dict[str, str] = {}
    display_to_input_net: Dict[str, str] = {}

    lines = ["* RapidChip Live Circuit Simulator Netlist"]

    for n in nodes:
        if n.id not in active_node_ids:
            continue

        clean_id = sanitize_spice_id(n.id)
        out_net = get_node_output_net(n.id)
        ntype = n.type.lower()

        if ntype == 'number':
            node_to_output_net[n.id] = out_net
            raw_val = n.data.get('value', 0) if n.data else 0
            try:
                val_float = float(raw_val)
            except (ValueError, TypeError):
                val_float = 0.0
            lines.append(f"V{clean_id} {out_net} 0 DC {val_float}")

        elif ntype == 'add':
            node_to_output_net[n.id] = out_net
            net_a = node_inputs[n.id].get('a', '0')
            net_b = node_inputs[n.id].get('b', '0')
            lines.append(f"B{clean_id} {out_net} 0 V = V({net_a}) + V({net_b})")

        elif ntype == 'multiply':
            node_to_output_net[n.id] = out_net
            net_a = node_inputs[n.id].get('a', '0')
            net_b = node_inputs[n.id].get('b', '0')
            lines.append(f"B{clean_id} {out_net} 0 V = V({net_a}) * V({net_b})")

        elif ntype == 'divide':
            node_to_output_net[n.id] = out_net
            net_a = node_inputs[n.id].get('a', '0')
            net_b = node_inputs[n.id].get('b', '0')
            lines.append(f"B{clean_id} {out_net} 0 V = V({net_a}) / V({net_b})")

        elif ntype == 'formula':
            node_to_output_net[n.id] = out_net
            net_a = node_inputs[n.id].get('a', '0')
            net_b = node_inputs[n.id].get('b', '0')
            expr = (n.data.get('expression', '0') if n.data else '0')
            # Translate 'a' -> V(net_a) and 'b' -> V(net_b)
            # Use word boundaries so 'a' in numbers or other symbols doesn't get messed up
            spice_expr = re.sub(r'\ba\b', f'(V({net_a}))', expr, flags=re.IGNORECASE)
            spice_expr = re.sub(r'\bb\b', f'(V({net_b}))', spice_expr, flags=re.IGNORECASE)
            lines.append(f"B{clean_id} {out_net} 0 V = {spice_expr}")

        elif ntype == 'display':
            # Display has no netlist line; we read V(<in>) from ngspice output
            in_net = node_inputs[n.id].get('in')
            if in_net:
                display_to_input_net[n.id] = in_net

    lines.append(".op")
    lines.append(".end")

    netlist_str = "\n".join(lines) + "\n"
    return netlist_str, node_to_output_net, display_to_input_net
