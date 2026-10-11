import pytest
from app.models import SimulationRequest, GraphNode, GraphEdge
from app.main import simulate

@pytest.mark.asyncio
async def test_graph_1_add_display():
    """Graph 1: Number 2 and Number 3 -> Add -> Display => Display = 5"""
    nodes = [
        GraphNode(id="n1", type="number", data={"value": 2}),
        GraphNode(id="n2", type="number", data={"value": 3}),
        GraphNode(id="add1", type="add"),
        GraphNode(id="disp1", type="display"),
    ]
    edges = [
        GraphEdge(id="e1", source="n1", target="add1", targetHandle="a"),
        GraphEdge(id="e2", source="n2", target="add1", targetHandle="b"),
        GraphEdge(id="e3", source="add1", target="disp1", targetHandle="in"),
    ]
    req = SimulationRequest(nodes=nodes, edges=edges, version=1)
    res = await simulate(req)

    assert res.results["disp1"].value == 5
    assert res.results["add1"].value == 5
    assert res.results["disp1"].error is None
    assert res.results["disp1"].blocked is False

@pytest.mark.asyncio
async def test_graph_2_add_multiply_display():
    """Graph 2: Graph 1's Add -> Multiply with Number 4 -> Display => Display = 20"""
    nodes = [
        GraphNode(id="n1", type="number", data={"value": 2}),
        GraphNode(id="n2", type="number", data={"value": 3}),
        GraphNode(id="add1", type="add"),
        GraphNode(id="n4", type="number", data={"value": 4}),
        GraphNode(id="mul1", type="multiply"),
        GraphNode(id="disp1", type="display"),
    ]
    edges = [
        GraphEdge(id="e1", source="n1", target="add1", targetHandle="a"),
        GraphEdge(id="e2", source="n2", target="add1", targetHandle="b"),
        GraphEdge(id="e3", source="add1", target="mul1", targetHandle="a"),
        GraphEdge(id="e4", source="n4", target="mul1", targetHandle="b"),
        GraphEdge(id="e5", source="mul1", target="disp1", targetHandle="in"),
    ]
    req = SimulationRequest(nodes=nodes, edges=edges, version=2)
    res = await simulate(req)

    assert res.results["disp1"].value == 20
    assert res.results["mul1"].value == 20

@pytest.mark.asyncio
async def test_graph_3_multiply_single_source():
    """Graph 3: One Number 7 wired into both inputs of Multiply => Display = 49"""
    nodes = [
        GraphNode(id="n7", type="number", data={"value": 7}),
        GraphNode(id="mul1", type="multiply"),
        GraphNode(id="disp1", type="display"),
    ]
    edges = [
        GraphEdge(id="e1", source="n7", target="mul1", targetHandle="a"),
        GraphEdge(id="e2", source="n7", target="mul1", targetHandle="b"),
        GraphEdge(id="e3", source="mul1", target="disp1", targetHandle="in"),
    ]
    req = SimulationRequest(nodes=nodes, edges=edges, version=3)
    res = await simulate(req)

    assert res.results["disp1"].value == 49
    assert res.results["mul1"].value == 49

@pytest.mark.asyncio
async def test_graph_4_divide_by_zero():
    """Graph 4: Number 10 / Number 0 -> Display: Divide shows error; Display shows blocked"""
    nodes = [
        GraphNode(id="n10", type="number", data={"value": 10}),
        GraphNode(id="n0", type="number", data={"value": 0}),
        GraphNode(id="div1", type="divide"),
        GraphNode(id="disp1", type="display"),
    ]
    edges = [
        GraphEdge(id="e1", source="n10", target="div1", targetHandle="a"),
        GraphEdge(id="e2", source="n0", target="div1", targetHandle="b"),
        GraphEdge(id="e3", source="div1", target="disp1", targetHandle="in"),
    ]
    req = SimulationRequest(nodes=nodes, edges=edges, version=4)
    res = await simulate(req)

    assert "Division by zero" in res.results["div1"].error
    assert res.results["div1"].value is None
    assert res.results["disp1"].blocked is True
    assert res.results["disp1"].value is None

@pytest.mark.asyncio
async def test_graph_5_add_single_input():
    """Graph 5: Add with only one input wired => That Add node is highlighted/errored"""
    nodes = [
        GraphNode(id="n1", type="number", data={"value": 5}),
        GraphNode(id="add1", type="add"),
        GraphNode(id="disp1", type="display"),
    ]
    edges = [
        GraphEdge(id="e1", source="n1", target="add1", targetHandle="a"),
        GraphEdge(id="e2", source="add1", target="disp1", targetHandle="in"),
    ]
    req = SimulationRequest(nodes=nodes, edges=edges, version=5)
    res = await simulate(req)

    assert res.results["add1"].error is not None
    assert "Missing connection" in res.results["add1"].error
    assert res.results["disp1"].blocked is True

@pytest.mark.asyncio
async def test_graph_6_loop_detection():
    """Graph 6: Add -> Multiply -> back into the same Add => Loop flagged on nodes involved"""
    nodes = [
        GraphNode(id="n1", type="number", data={"value": 1}),
        GraphNode(id="add1", type="add"),
        GraphNode(id="mul1", type="multiply"),
        GraphNode(id="disp1", type="display"),
    ]
    edges = [
        GraphEdge(id="e1", source="n1", target="add1", targetHandle="a"),
        GraphEdge(id="e2", source="mul1", target="add1", targetHandle="b"),
        GraphEdge(id="e3", source="add1", target="mul1", targetHandle="a"),
        GraphEdge(id="e4", source="n1", target="mul1", targetHandle="b"),
        GraphEdge(id="e5", source="mul1", target="disp1", targetHandle="in"),
    ]
    req = SimulationRequest(nodes=nodes, edges=edges, version=6)
    res = await simulate(req)

    assert res.results["add1"].error is not None
    assert "Loop detected" in res.results["add1"].error
    assert res.results["mul1"].error is not None
    assert "Loop detected" in res.results["mul1"].error
    assert res.results["disp1"].blocked is True

@pytest.mark.asyncio
async def test_graph_7_formula_execution():
    """Graph 7: Formula a * 2 + b with a = 3, b = 4 => Display = 10"""
    nodes = [
        GraphNode(id="n3", type="number", data={"value": 3}),
        GraphNode(id="n4", type="number", data={"value": 4}),
        GraphNode(id="f1", type="formula", data={"expression": "a * 2 + b"}),
        GraphNode(id="disp1", type="display"),
    ]
    edges = [
        GraphEdge(id="e1", source="n3", target="f1", targetHandle="a"),
        GraphEdge(id="e2", source="n4", target="f1", targetHandle="b"),
        GraphEdge(id="e3", source="f1", target="disp1", targetHandle="in"),
    ]
    req = SimulationRequest(nodes=nodes, edges=edges, version=7)
    res = await simulate(req)

    assert res.results["disp1"].value == 10
    assert res.results["f1"].value == 10

@pytest.mark.asyncio
async def test_graph_8_unsafe_formula():
    """Graph 8: Formula a + b followed by newline and .control shell ls => Rejected with clear message; nothing executes"""
    malicious_expr = "a + b\n.control\nshell ls"
    nodes = [
        GraphNode(id="n1", type="number", data={"value": 1}),
        GraphNode(id="n2", type="number", data={"value": 2}),
        GraphNode(id="f1", type="formula", data={"expression": malicious_expr}),
        GraphNode(id="disp1", type="display"),
    ]
    edges = [
        GraphEdge(id="e1", source="n1", target="f1", targetHandle="a"),
        GraphEdge(id="e2", source="n2", target="f1", targetHandle="b"),
        GraphEdge(id="e3", source="f1", target="disp1", targetHandle="in"),
    ]
    req = SimulationRequest(nodes=nodes, edges=edges, version=8)
    res = await simulate(req)

    assert res.results["f1"].error is not None
    assert "Newlines are not permitted" in res.results["f1"].error or "Invalid" in res.results["f1"].error
    assert res.results["disp1"].blocked is True
    # Nothing executes: netlist must be None
    assert res.netlist is None
