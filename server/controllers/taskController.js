const taskModel = require('../models/taskModel');

async function getTasks(req, res, next) {
  try {
    res.json(await taskModel.getAllTasks());
  } catch (error) {
    next(error);
  }
}

async function createTask(req, res, next) {
  const { title, description = '', completed = false } = req.body;

  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required.' });
  }

  if (typeof description !== 'string' || typeof completed !== 'boolean') {
    return res.status(400).json({
      error: 'Description must be a string and completed must be a boolean.'
    });
  }

  try {
    const task = await taskModel.createTask({ title, description, completed });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res, next) {
  const { title, description, completed } = req.body;

  if (
    (title !== undefined && (typeof title !== 'string' || title.trim() === '')) ||
    (description !== undefined && typeof description !== 'string') ||
    (completed !== undefined && typeof completed !== 'boolean')
  ) {
    return res.status(400).json({
      error: 'Title must be a non-empty string, description a string, and completed a boolean.'
    });
  }

  try {
    if (!await taskModel.findTaskById(req.params.id)) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const task = await taskModel.updateTask(req.params.id, { title, description, completed });
    res.json(task);
  } catch (error) {
    next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    if (!await taskModel.deleteTask(req.params.id)) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
