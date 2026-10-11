import express from 'express';
import mongoose from 'mongoose';
import Graph from '../models/Graph.js';

const router = express.Router();

// Fallback in-memory storage when MongoDB is not connected
const inMemoryStore = new Map();

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

// GET all saved graphs
router.get('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const graphs = await Graph.find({}, '_id name createdAt updatedAt')
        .sort({ updatedAt: -1 })
        .lean();
      return res.json(graphs);
    } else {
      const list = Array.from(inMemoryStore.values()).map(g => ({
        _id: g._id,
        name: g.name,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
        nodeCount: (g.nodes || []).length,
      }));
      return res.json(list);
    }
  } catch (err) {
    console.error('Failed to list graphs:', err);
    res.status(500).json({ error: 'Failed to retrieve saved graphs' });
  }
});

// GET specific graph by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected()) {
      const graph = await Graph.findById(id).lean();
      if (!graph) {
        return res.status(404).json({ error: 'Graph not found' });
      }
      return res.json(graph);
    } else {
      const graph = inMemoryStore.get(id);
      if (!graph) {
        return res.status(404).json({ error: 'Graph not found' });
      }
      return res.json(graph);
    }
  } catch (err) {
    console.error(`Failed to load graph ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to load graph' });
  }
});

// POST save a graph
router.post('/', async (req, res) => {
  try {
    const { name = 'Untitled Circuit', nodes = [], edges = [] } = req.body;
    const now = new Date();

    if (isMongoConnected()) {
      const newGraph = new Graph({
        name,
        nodes,
        edges,
      });
      const saved = await newGraph.save();
      return res.status(201).json(saved);
    } else {
      const newId = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const saved = {
        _id: newId,
        name,
        nodes,
        edges,
        createdAt: now,
        updatedAt: now,
      };
      inMemoryStore.set(newId, saved);
      return res.status(201).json(saved);
    }
  } catch (err) {
    console.error('Failed to save graph:', err);
    res.status(500).json({ error: 'Failed to save graph' });
  }
});

// DELETE a graph
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected()) {
      await Graph.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Graph deleted' });
    } else {
      inMemoryStore.delete(id);
      return res.json({ success: true, message: 'Graph deleted' });
    }
  } catch (err) {
    console.error('Failed to delete graph:', err);
    res.status(500).json({ error: 'Failed to delete graph' });
  }
});

export default router;
