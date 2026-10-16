import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { once } from 'node:events';

const file = new URL('../src/data/tasks.json', import.meta.url);
const backup = await readFile(file);
const base = 'http://127.0.0.1:31947';
let child;
let logs = '';
let failures = 0;
async function start() {
  child = spawn(process.execPath, ['src/server.js'], {
    env: { ...process.env, PORT: '31947' }, stdio: ['ignore', 'pipe', 'pipe']
  });
  child.stdout.on('data', chunk => { logs += chunk; });
  child.stderr.on('data', chunk => { logs += chunk; });
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw new Error('Server exited: ' + logs);
    try { if ((await fetch(base + '/api/health')).status === 200) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error('Server startup timeout');
}
async function stop() {
  if (child && child.exitCode === null) {
    const ended = once(child, 'exit');
    child.kill();
    await ended;
    child = undefined;
  }
}
async function request(method, path, body, expected) {
  const response = await fetch(base + path, { method,
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body) });
  assert.equal(response.status, expected, method + ' ' + path);
  const text = await response.text();
  if (expected === 204) { assert.equal(text, ''); return; }
  assert.match(response.headers.get('content-type'), /application\/json/);
  return JSON.parse(text);
}
async function check(name, action) {
  try { await action(); console.log('PASS ' + name); }
  catch (error) { failures++; console.error('FAIL ' + name, error, logs); throw error; }
}
try {
  await writeFile(file, '[]\n');
  await start();
  let task;
  await check('create / defaults / disk', async () => {
    task = await request('POST', '/tasks', { title: 'Persistence test' }, 201);
    assert.equal(task.status, 'pending'); assert.equal(task.priority, 'medium');
    assert.equal(task.createdAt, task.updatedAt);
    assert.equal(JSON.parse(await readFile(file, 'utf8'))[0].id, task.id);
  });
  await check('list and detail', async () => {
    assert.deepEqual(await request('GET', '/tasks', undefined, 200), [task]);
    assert.deepEqual(await request('GET', '/tasks/' + task.id, undefined, 200), task);
  });
  await check('update', async () => {
    const updated = await request('PUT', '/tasks/' + task.id,
      { status: 'in-progress', priority: 'high', assignee: 'musa' }, 200);
    assert.equal(updated.status, 'in-progress'); assert.equal(updated.title, task.title);
    assert.equal(updated.createdAt, task.createdAt); assert.notEqual(updated.updatedAt, task.updatedAt);
    task = updated;
  });
  await check('restart persistence', async () => {
    await stop(); await start();
    assert.deepEqual(await request('GET', '/tasks/' + task.id, undefined, 200), task);
  });
  await check('delete / empty 204 / deleted 404', async () => {
    await request('DELETE', '/tasks/' + task.id, undefined, 204);
    assert.equal((await request('GET', '/tasks/' + task.id, undefined, 404)).error.code, 'TASK_NOT_FOUND');
    await request('PUT', '/tasks/' + task.id, { title: 'x' }, 404);
    await request('DELETE', '/tasks/' + task.id, undefined, 404);
  });
  await check('invalid input / enum / immutable fields / missing body', async () => {
    for (const body of [{}, { title: '' }, { title: 'x', status: 'in_progress' },
      { title: 'x', priority: 'urgent' }, { title: 'x', id: 'custom' }, [], null]) {
      assert.equal((await request('POST', '/tasks', body, 400)).error.code, 'INVALID_TASK_DATA');
    }
    await request('POST', '/tasks', undefined, 415);
    const result = await fetch(base + '/tasks', { method: 'POST',
      headers: { 'Content-Type': 'application/json' }, body: '{' });
    assert.equal(result.status, 400); assert.equal((await result.json()).error.code, 'INVALID_JSON');
  });
  await check('20 concurrent creates / unique IDs / no lost writes', async () => {
    const created = await Promise.all(Array.from({ length: 20 }, (_, i) =>
      request('POST', '/tasks', { title: 'Concurrent ' + i }, 201)));
    assert.equal(new Set(created.map(item => item.id)).size, 20);
    const saved = JSON.parse(await readFile(file, 'utf8'));
    assert.equal(saved.length, 20);
    await Promise.all(created.map(item => request('DELETE', '/tasks/' + item.id, undefined, 204)));
    assert.deepEqual(JSON.parse(await readFile(file, 'utf8')), []);
  });
  await check('missing / blank / corrupt file fails safely; queue recovers', async () => {
    await unlink(file);
    assert.equal((await request('GET', '/tasks', undefined, 500)).error.code, 'INTERNAL_ERROR');
    for (const content of ['', '{bad', '[{"id":"broken"}]']) {
      await writeFile(file, content);
      await request('POST', '/tasks', { title: 'must not overwrite' }, 500);
      assert.equal(await readFile(file, 'utf8'), content);
    }
    await writeFile(file, '[]');
    assert.deepEqual(await request('GET', '/tasks', undefined, 200), []);
  });
  await check('logger: health, CRUD and failed requests', async () => {
    await stop();
    const entries = logs.split(/\r?\n/).filter(line => line.startsWith('{')).map(line => JSON.parse(line));
    for (const method of ['GET', 'POST', 'PUT', 'DELETE']) assert.ok(entries.some(entry => entry.method === method));
    assert.ok(entries.some(entry => entry.endpoint === '/api/health'));
    for (const entry of entries) {
      assert.equal(typeof entry.endpoint, 'string');
      assert.ok(Number.isFinite(Date.parse(entry.timestamp)));
    }
    console.log('Logger sample: ' + JSON.stringify(entries.find(entry => entry.method === 'POST')));
  });
} finally {
  await stop();
  await writeFile(file, backup);
}
console.log('Failed checks: ' + failures);
