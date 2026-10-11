from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

class NodeData(BaseModel):
    value: Optional[Any] = None
    expression: Optional[str] = None
    label: Optional[str] = None

class GraphNode(BaseModel):
    id: str
    type: str
    data: Optional[Dict[str, Any]] = Field(default_factory=dict)
    position: Optional[Dict[str, float]] = None

class GraphEdge(BaseModel):
    id: Optional[str] = None
    source: str
    sourceHandle: Optional[str] = None
    target: str
    targetHandle: Optional[str] = None

class SimulationRequest(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    version: Optional[int] = 0

class NodeResult(BaseModel):
    nodeId: str
    value: Optional[float] = None
    error: Optional[str] = None
    blocked: bool = False
    blockedBy: Optional[List[str]] = None

class SimulationResponse(BaseModel):
    version: Optional[int] = 0
    results: Dict[str, NodeResult] = Field(default_factory=dict)
    errors: List[str] = Field(default_factory=list)
    netlist: Optional[str] = None
    rawOutput: Optional[str] = None
