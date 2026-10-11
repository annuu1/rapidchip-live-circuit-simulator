import re
from typing import Dict, List, Set, Tuple, Optional
from app.models import GraphNode, GraphEdge, NodeResult

# Strict allowed characters for formula: digits, decimal, a, b, +, -, *, /, (, ), space
SAFE_FORMULA_CHARS_REGEX = re.compile(r'^[0-9a-bA-B\s\+\-\*\/\(\)\.]+$')
IDENTIFIER_REGEX = re.compile(r'[a-zA-Z_]+')

def validate_formula_expression(expr: Optional[str]) -> Tuple[bool, Optional[str]]:
    """
    Validates a Formula expression.
    PDF Requirement:
    "Allow only numbers, a, b, + - * / and brackets.
     Input like a\n.control\nshell ls must never reach ngspice."
    """
    if not expr or not expr.strip():
        return False, "Formula expression cannot be empty"
    
    # Check for newlines or carriage returns
    if '\n' in expr or '\r' in expr:
        return False, "Newlines are not permitted in formula expression"
    
    # Check overall allowed characters
    if not SAFE_FORMULA_CHARS_REGEX.match(expr):
        return False, "Invalid characters in formula: only numbers, a, b, +, -, *, /, and () are allowed"
    
    # Check that any word identifier is strictly 'a' or 'b'
    identifiers = IDENTIFIER_REGEX.findall(expr)
    for ident in identifiers:
        if ident.lower() not in ('a', 'b'):
            return False, f"Unknown variable '{ident}': only 'a' and 'b' are permitted"
    
    return True, None


def find_cycles(nodes: List[GraphNode], edges: List[GraphEdge]) -> Set[str]:
    """
    Finds all nodes involved in directed cycles.
    Uses DFS 3-color marking (0=unvisited, 1=visiting, 2=visited).
    """
    adj: Dict[str, List[str]] = {n.id: [] for n in nodes}
    for e in edges:
        if e.source in adj and e.target in adj:
            adj[e.source].append(e.target)

    color: Dict[str, int] = {n.id: 0 for n in nodes}
    parent: Dict[str, Optional[str]] = {n.id: None for n in nodes}
    cycle_nodes: Set[str] = set()

    def dfs(u: str, path: List[str]):
        color[u] = 1
        path.append(u)

        for v in adj.get(u, []):
            if color[v] == 1:
                # Cycle detected! All nodes from v to u in current path
                try:
                    idx = path.index(v)
                    for node_in_cycle in path[idx:]:
                        cycle_nodes.add(node_in_cycle)
                except ValueError:
                    cycle_nodes.add(v)
                    cycle_nodes.add(u)
            elif color[v] == 0:
                dfs(v, path)

        path.pop()
        color[u] = 2

    for n in nodes:
        if color[n.id] == 0:
            dfs(n.id, [])

    return cycle_nodes


def get_downstream_nodes(start_nodes: Set[str], edges: List[GraphEdge]) -> Set[str]:
    """
    Finds all nodes reachable downstream from the given start nodes.
    """
    adj: Dict[str, List[str]] = {}
    for e in edges:
        adj.setdefault(e.source, []).append(e.target)

    visited: Set[str] = set()
    stack = list(start_nodes)
    while stack:
        curr = stack.pop()
        for nxt in adj.get(curr, []):
            if nxt not in visited and nxt not in start_nodes:
                visited.add(nxt)
                stack.append(nxt)
    return visited
