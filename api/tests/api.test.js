import test from 'node:test';
import assert from 'node:assert';

test('API Health check responds with 200', async () => {
  const res = await fetch('http://localhost:5000/api/health');
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'ok');
  assert.strictEqual(data.service, 'rapidchip-node-api');
});

test('Save and retrieve graph in API', async () => {
  const newGraph = {
    name: 'Test Circuit',
    nodes: [{ id: '1', type: 'number', data: { value: 42 } }],
    edges: [],
  };

  const saveRes = await fetch('http://localhost:5000/api/graphs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newGraph),
  });

  assert.strictEqual(saveRes.status, 201);
  const savedData = await saveRes.json();
  assert.strictEqual(savedData.name, 'Test Circuit');
  assert.ok(savedData._id);

  // Retrieve list
  const listRes = await fetch('http://localhost:5000/api/graphs');
  assert.strictEqual(listRes.status, 200);
  const list = await listRes.json();
  const found = list.find((g) => g._id === savedData._id);
  assert.ok(found);

  // Retrieve by ID
  const getRes = await fetch(`http://localhost:5000/api/graphs/${savedData._id}`);
  assert.strictEqual(getRes.status, 200);
  const fetched = await getRes.json();
  assert.strictEqual(fetched.name, 'Test Circuit');

  // Clean up
  const delRes = await fetch(`http://localhost:5000/api/graphs/${savedData._id}`, {
    method: 'DELETE',
  });
  assert.strictEqual(delRes.status, 200);
});

test('Forward simulation to Python service via Node API', async () => {
  const simReq = {
    version: 1,
    nodes: [
      { id: 'n1', type: 'number', data: { value: 15 } },
      { id: 'n2', type: 'number', data: { value: 25 } },
      { id: 'add1', type: 'add', data: {} },
      { id: 'disp1', type: 'display', data: {} },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'add1', targetHandle: 'a' },
      { id: 'e2', source: 'n2', target: 'add1', targetHandle: 'b' },
      { id: 'e3', source: 'add1', target: 'disp1', targetHandle: 'in' },
    ],
  };

  const res = await fetch('http://localhost:5000/api/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(simReq),
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.version, 1);
  assert.strictEqual(data.results['disp1'].value, 40);
});
