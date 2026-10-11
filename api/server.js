import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import simulateRouter from './routes/simulate.js';
import graphsRouter from './routes/graphs.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/circuits';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/simulate', simulateRouter);
app.use('/api/graphs', graphsRouter);

app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    service: 'rapidchip-node-api',
    mongo: mongoStatus,
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  // Connect to MongoDB
  try {
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('Connected to MongoDB successfully.');
  } catch (err) {
    console.warn(`MongoDB connection failed (${err.message}). Using in-memory storage fallback.`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Node API server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

export default app;
