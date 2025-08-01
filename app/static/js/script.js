document.addEventListener('DOMContentLoaded', () => {
    const addTaskForm = document.getElementById('addTaskForm');
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescInput = document.getElementById('taskDesc');
    const taskList = document.getElementById('taskList');
    const noTasksMessage = document.getElementById('noTasksMessage');

    const updateNoTasksMessage = () => {
        const visibleTasks = Array.from(taskList.children).filter(child => child.id !== 'noTasksMessage');

        if (visibleTasks.length === 0) {
            if (!document.getElementById('noTasksMessage')) {
                const li = document.createElement('li');
                li.id = 'noTasksMessage';
                li.className = 'list-group-item';
                li.textContent = 'No tasks to display.';
                taskList.appendChild(li);
            }
        } else {
            const msg = document.getElementById('noTasksMessage');
            if (msg) {
                msg.remove();
            }
        }
    };

    addTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const title = taskTitleInput.value.trim();
        const desc = taskDescInput.value.trim(); 

        if (!title) {
            alert('Task title cannot be empty!');
            return;
        }
        try {
            const response = await fetch('/tasks/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ title, desc, completed: false })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const newTask = await response.json(); 
            renderTask(newTask); 
            taskTitleInput.value = '';
            taskDescInput.value = '';
            updateNoTasksMessage();

        } catch (error) {
            console.error('Error occurred while adding the task:', error);
            alert('An error occurred while adding the task.');
        }
    });

    const renderTask = (task) => {
        const li = document.createElement('li');
        li.className = `list-group-item d-flex justify-content-between align-items-center ${task.completed ? 'list-group-item-success' : ''}`;
        li.setAttribute('data-task-id', task.id);
        li.innerHTML = `
            <div>
                <input class="form-check-input me-2" type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskCompletion(this, ${task.id})">
                <span class="${task.completed ? 'text-decoration-line-through' : ''}">${task.title}</span>
                ${task.desc ? `<small class="text-muted d-block ms-4">${task.desc}</small>` : ''}
            </div>
            <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.id})">Delete</button>
        `;
        taskList.appendChild(li);
    };

    window.toggleTaskCompletion = async (checkbox, taskId) => {
        const completed = checkbox.checked;
        const listItem = checkbox.closest('li');
        const titleSpan = listItem.querySelector('span');

        try {
            const response = await fetch(`/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ completed: completed })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (completed) {
                listItem.classList.add('list-group-item-success');
                titleSpan.classList.add('text-decoration-line-through');
            } else {
                listItem.classList.remove('list-group-item-success');
                titleSpan.classList.remove('text-decoration-line-through');
            }

        } catch (error) {
            console.error('Błąd podczas aktualizacji zadania:', error);
            alert('An error occurred while updating the task.');
            checkbox.checked = !completed;
        }
    };

    window.deleteTask = async (taskId) => {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            const response = await fetch(`/tasks/${taskId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            document.querySelector(`[data-task-id="${taskId}"]`).remove();
            updateNoTasksMessage();

        } catch (error) {
            console.error('Błąd podczas usuwania zadania:', error);
            alert('An error occurred while deleting the task.');
        }
    };
    updateNoTasksMessage();
});