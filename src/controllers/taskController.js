import * as service from '../services/taskService.js';

export async function createTask(req, res) {
  const task = await service.createTask(req.body);
  res.location('/tasks/' + task.id).status(201).json(task);
}

export async function listTasks(req, res) {
  res.status(200).json(await service.listTasks());
}

export async function getTask(req, res) {
  res.status(200).json(await service.getTask(req.params.id));
}

export async function updateTask(req, res) {
  res.status(200).json(await service.updateTask(req.params.id, req.body));
}

export async function deleteTask(req, res) {
  await service.deleteTask(req.params.id);
  res.status(204).end();
}
