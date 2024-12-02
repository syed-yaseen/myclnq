const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Load tasks from storage or initialize an empty array
const TASKS_FILE = 'tasks.json';
let tasks = [];

// Load tasks from file on server start
if (fs.existsSync(TASKS_FILE)) {
    tasks = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
}

// Save tasks to file
const saveTasksToFile = () => {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
};

// Routes

// 1. Set up a basic Express.js server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// 2. Create a task
app.post('/tasks', (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }

    const task = { id: uuidv4(), title, description, status: 'pending' };
    tasks.push(task);
    saveTasksToFile();
    res.status(201).json({ message: 'Task created successfully', task });
});

// 3. Get all tasks
app.get('/tasks', (req, res) => {
    res.status(200).json(tasks);
});

// 4. Update a task
app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    const task = tasks.find(task => task.id === id);
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }

    task.status = status;
    saveTasksToFile();
    res.status(200).json({ message: 'Task updated successfully', task });
});

// 5. Delete a task
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }

    tasks.splice(taskIndex, 1);
    saveTasksToFile();
    res.status(200).json({ message: 'Task deleted successfully' });
});

// 6. Filter tasks by status
app.get('/tasks/status/:status', (req, res) => {
    const { status } = req.params;

    if (!['pending', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    const filteredTasks = tasks.filter(task => task.status === status);
    res.status(200).json(filteredTasks);
});

// 7. Handle invalid routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
