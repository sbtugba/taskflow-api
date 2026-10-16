import { setTimeout as delay } from 'node:timers/promises';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile, rename, unlink } from 'node:fs/promises';

const file = new URL('../data/tasks.json', import.meta.url);
const fields = ['title', 'description', 'assignee', 'status', 'priority'];
const statuses = ['pending', 'in-progress', 'completed'];
const priorities = ['low', 'medium', 'high'];
let queue = Promise.resolve();

// Serialize complete transactions, including reads, within this Node.js process.
function transaction(operation) {
  const result = queue.then(operation);
  queue = result.catch(() => {});
  return result;
}

function badRequest(message) {
  return Object.assign(new Error(message), { status: 400, code: 'INVALID_TASK_DATA' });
}

function validate(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Object.keys(input).length) {
    throw badRequest('En az bir görev alanı içeren JSON nesnesi gönderilmelidir.');
  }
  const result = {};
  for (const [key, value] of Object.entries(input)) {
    if (!fields.includes(key)) throw badRequest('Geçersiz veya değiştirilemez alan: ' + key);
    if (typeof value !== 'string') throw badRequest(key + ' metin olmalıdır.');
    result[key] = value.trim();
  }
  if ('title' in result && !result.title) throw badRequest('title boş olamaz.');
  if ('status' in result && !statuses.includes(result.status)) throw badRequest('Geçersiz status.');
  if ('priority' in result && !priorities.includes(result.priority)) throw badRequest('Geçersiz priority.');
  return result;
}

async function load() {
  // Missing, blank or corrupt files fail closed; existing data is never reset silently.
  const tasks = JSON.parse(await readFile(file, 'utf8'));
  if (!Array.isArray(tasks)) throw new Error('Task verisi bir dizi olmalıdır.');
  const ids = new Set();
  for (const task of tasks) {
    if (!task || typeof task !== 'object' || Object.keys(task).length !== 8 ||
        typeof task.id !== 'string' || !task.id || ids.has(task.id) ||
        !fields.every(key => typeof task[key] === 'string') || !task.title.trim() ||
        !statuses.includes(task.status) || !priorities.includes(task.priority) ||
        !['createdAt', 'updatedAt'].every(key => typeof task[key] === 'string' &&
          Number.isFinite(Date.parse(task[key])))) {
      throw new Error('Geçersiz Task kaydı.');
    }
    ids.add(task.id);
  }
  return tasks;
}

async function save(tasks) {
  const temporary = new URL('tasks.json.' + randomUUID() + '.tmp', file);
  try {
    await writeFile(temporary, JSON.stringify(tasks, null, 2) + '\n', { flag: 'wx' });
    for (let attempt = 0; ; attempt++) {
      try {
        await rename(temporary, file);
        break;
      } catch (error) {
        // Windows sync/indexing software can briefly lock the destination.
        if (!['EPERM', 'EACCES', 'EBUSY'].includes(error.code) || attempt >= 4) throw error;
        await delay(25 * (attempt + 1));
      }
    }
  } finally {
    await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') console.error(error); });
  }
}

function find(tasks, id) {
  const index = tasks.findIndex(task => task.id === id);
  if (index === -1) throw Object.assign(new Error('Görev bulunamadı.'), {
    status: 404, code: 'TASK_NOT_FOUND'
  });
  return index;
}

export function listTasks() {
  return transaction(load);
}

export function getTask(id) {
  return transaction(async () => {
    const tasks = await load();
    return tasks[find(tasks, id)];
  });
}

export function createTask(input) {
  return transaction(async () => {
    const values = validate(input);
    if (!values.title) throw badRequest('title zorunludur.');
    const tasks = await load();
    let id;
    do { id = randomUUID(); } while (tasks.some(task => task.id === id));
    const now = new Date().toISOString();
    const task = { id, title: values.title, description: '', assignee: '',
      status: 'pending', priority: 'medium', ...values, createdAt: now, updatedAt: now };
    tasks.push(task);
    await save(tasks);
    return task;
  });
}

export function updateTask(id, input) {
  return transaction(async () => {
    const tasks = await load();
    const index = find(tasks, id);
    const values = validate(input);
    tasks[index] = { ...tasks[index], ...values, updatedAt: new Date().toISOString() };
    await save(tasks);
    return tasks[index];
  });
}

export function deleteTask(id) {
  return transaction(async () => {
    const tasks = await load();
    tasks.splice(find(tasks, id), 1);
    await save(tasks);
  });
}
