const test = require('node:test');
const assert = require('node:assert/strict');
const taskModel = require('../models/taskModel');
const taskController = require('./taskController');

function responseDouble() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    }
  };
}

test('createTask rejects a missing title', async () => {
  const response = responseDouble();
  await taskController.createTask({ body: { title: '  ' } }, response, () => {
    throw new Error('next should not be called');
  });

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.body, { error: 'Title is required.' });
});

test('getTasks returns tasks from the model', async () => {
  const originalGetAllTasks = taskModel.getAllTasks;
  taskModel.getAllTasks = async () => [{ id: '1', title: 'Test task' }];

  try {
    const response = responseDouble();
    await taskController.getTasks({}, response, (error) => {
      throw error;
    });

    assert.deepEqual(response.body, [{ id: '1', title: 'Test task' }]);
  } finally {
    taskModel.getAllTasks = originalGetAllTasks;
  }
});