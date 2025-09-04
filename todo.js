// Simple To-Do App JavaScript
class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
        this.currentFilter = 'all';
        this.editingId = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.render();
    }
    
    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.taskList = document.getElementById('taskList');
        this.taskCount = document.getElementById('taskCount');
        this.clearCompleted = document.getElementById('clearCompleted');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }
    
    attachEventListeners() {
        // Add task
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
        
        // Filter buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
        
        // Clear completed
        this.clearCompleted.addEventListener('click', () => this.clearCompletedTasks());
    }
    
    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) return;
        
        if (this.editingId !== null) {
            // Update existing task
            const task = this.tasks.find(t => t.id === this.editingId);
            if (task) {
                task.text = text;
                task.updatedAt = new Date().toISOString();
            }
            this.editingId = null;
            this.addBtn.textContent = 'Add Task';
        } else {
            // Add new task
            const task = {
                id: Date.now(),
                text: text,
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.tasks.push(task);
        }
        
        this.taskInput.value = '';
        this.saveToStorage();
        this.render();
    }
    
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.updatedAt = new Date().toISOString();
            this.saveToStorage();
            this.render();
        }
    }
    
    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            this.taskInput.value = task.text;
            this.taskInput.focus();
            this.editingId = id;
            this.addBtn.textContent = 'Update Task';
        }
    }
    
    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            if (this.editingId === id) {
                this.editingId = null;
                this.taskInput.value = '';
                this.addBtn.textContent = 'Add Task';
            }
            this.saveToStorage();
            this.render();
        }
    }
    
    clearCompletedTasks() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) return;
        
        if (confirm(`Delete ${completedCount} completed task${completedCount > 1 ? 's' : ''}?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveToStorage();
            this.render();
        }
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }
    
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            default:
                return this.tasks;
        }
    }
    
    render() {
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            this.renderEmptyState();
        } else {
            this.renderTasks(filteredTasks);
        }
        
        this.updateStats();
    }
    
    renderEmptyState() {
        const emptyMessages = {
            all: 'No tasks yet. Add one above to get started! 🚀',
            active: 'No active tasks. Great job! 🎉',
            completed: 'No completed tasks yet. Keep working! 💪'
        };
        
        this.taskList.innerHTML = `
            <div class="empty-state">
                <h3>📝</h3>
                <p>${emptyMessages[this.currentFilter]}</p>
            </div>
        `;
    }
    
    renderTasks(tasks) {
        this.taskList.innerHTML = tasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="todoApp.toggleTask(${task.id})">
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <div class="task-actions">
                    <button class="edit-btn" onclick="todoApp.editTask(${task.id})" 
                            ${task.completed ? 'disabled' : ''}>Edit</button>
                    <button class="delete-btn" onclick="todoApp.deleteTask(${task.id})">Delete</button>
                </div>
            </li>
        `).join('');
    }
    
    updateStats() {
        const totalTasks = this.tasks.length;
        const activeTasks = this.tasks.filter(t => !t.completed).length;
        const completedTasks = totalTasks - activeTasks;
        
        // Update task count
        if (totalTasks === 0) {
            this.taskCount.textContent = 'No tasks';
        } else if (activeTasks === 0) {
            this.taskCount.textContent = 'All tasks completed! 🎉';
        } else if (activeTasks === 1) {
            this.taskCount.textContent = '1 task remaining';
        } else {
            this.taskCount.textContent = `${activeTasks} tasks remaining`;
        }
        
        // Show/hide clear completed button
        this.clearCompleted.style.display = completedTasks > 0 ? 'block' : 'none';
    }
    
    saveToStorage() {
        try {
            localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to add task
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        document.getElementById('taskInput').focus();
    }
    
    // Escape to cancel editing
    if (e.key === 'Escape' && window.todoApp && window.todoApp.editingId !== null) {
        window.todoApp.editingId = null;
        window.todoApp.taskInput.value = '';
        window.todoApp.addBtn.textContent = 'Add Task';
    }
});