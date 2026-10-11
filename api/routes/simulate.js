import express from 'express';

const router = express.Router();
const SIMULATION_SERVICE_URL = process.env.SIMULATION_SERVICE_URL || 'http://localhost:8000';

router.post('/', async (req, res) => {
  const { nodes = [], edges = [], version = 0 } = req.body;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const pyRes = await fetch(`${SIMULATION_SERVICE_URL}/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nodes, edges, version }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!pyRes.ok) {
      const errText = await pyRes.text();
      return res.status(pyRes.status).json({
        version,
        error: `Simulation service error: ${errText}`,
        serviceDown: false,
      });
    }

    const data = await pyRes.json();
    return res.json(data);
  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    console.error(`Simulation backend error (${isTimeout ? 'timeout' : 'network'}):`, err.message);

    return res.status(200).json({
      version,
      results: {},
      errors: [
        isTimeout
          ? 'Simulation service timed out (took > 6s)'
          : `Simulation service unreachable (${err.message})`,
      ],
      serviceDown: true,
      serviceError: isTimeout
        ? 'Simulation timed out'
        : 'Simulation backend service is currently offline or unreachable',
    });
  }
});

export default router;
