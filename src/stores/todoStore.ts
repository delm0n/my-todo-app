import { defineStore } from 'pinia';
import type { AppData, Project, Task, AppFilters } from '@/types';
import { loadFromStorage, saveToStorage, getInitialData } from '@/services/storage.service';
import { v4 as uuidv4 } from 'uuid';

export const useTodoStore = defineStore('todo', {
    state: () => ({
        appData: getInitialData() as AppData,
        isLoading: false as boolean,
        error: null as string | null,
        editingTaskId: null as string | null,
        editedTaskTitle: '' as string,
        editedTaskTagsInput: '' as string,
        showSubtasksForTaskId: null as string | null,
    }),

    getters: {
        currentProject: (state): Project | undefined => {
            return state.appData.projects[0];
        },

        currentProjectTasks: (state): Task[] => {
            const project = state.appData.projects[0];
            return project?.tasks ?? [];
        },

        allTagsInProject: (state): string[] => {

            const project = state.appData.projects[0];
            if (!project) return [];
            const tagsSet = new Set<string>();
            project.tasks.forEach((task) => {
                task.tags.forEach((tag) => tagsSet.add(tag));
                // Также добавляем теги из подзадач
                const collectTags = (t: Task) => {
                    t.tags.forEach((tag) => tagsSet.add(tag));
                    t.subtasks.forEach(collectTags);
                };
                task.subtasks.forEach(collectTags);
            });
            return Array.from(tagsSet).sort();
        },

        filteredTasks: (state): Task[] => {
            const project = state.appData.projects[0];
            if (!project) return [];

            const { statuses, tags, search } = state.appData.filters;
            const lowerCaseSearch = search.toLowerCase().trim();

            return project.tasks.filter((task) => {
                const statusMatch = statuses.length === 0 || statuses.includes(task.status);
                const tagMatch = tags.length === 0 || tags.some((tag) => task.tags.includes(tag));
                const searchMatch = !lowerCaseSearch || task.title.toLowerCase().includes(lowerCaseSearch);
                return statusMatch && tagMatch && searchMatch;
            });
        },
    },


    actions: {
        createNewTask(title: string = '', tags: string[] = []): Task {
            const now = new Date();
            return {
                id: uuidv4(),
                title,
                status: 'todo',
                tags,
                subtasks: [],
                createdAt: now,
                updatedAt: now,
            };
        },

        createNewProject(name: string = 'Мой проект'): Project {
            return {
                id: uuidv4(),
                name,
                tasks: [],
            };
        },

        parseTags(tagsString: string): string[] {
            return tagsString
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0);
        },

        loadData() {
            this.isLoading = true;
            this.error = null;
            try {
                const storedData = loadFromStorage();
                if (storedData) {
                    this.appData = storedData;
                } else {
                    // Если данных нет, используем начальные данные и сохраняем их
                    this.appData = getInitialData();
                    this.saveData();
                }
            } catch (err: any) {
                console.error('Ошибка при загрузке данных из хранилища:', err);
                this.error = 'Не удалось загрузить данные.';
                this.appData = getInitialData(); // Используем начальные данные в случае ошибки
            } finally {
                this.isLoading = false;
            }
        },

        saveData() {
            try {
                saveToStorage(this.appData);
            } catch (err: any) {
                console.error('Ошибка при сохранении данных в хранилище:', err);
                this.error = 'Не удалось сохранить данные.';
            }
        },

        addTask(title: string, tagsInput: string = '') {
            if (!title.trim() || !this.currentProject) return;

            const tags = this.parseTags(tagsInput);
            const newTask = this.createNewTask(title.trim(), tags);

            if (this.appData.projects.length === 0) {
                this.appData.projects.push(this.createNewProject());
            }

            this.appData.projects[0].tasks.push(newTask);
            this.saveData();
        },

        startEditing(task: Task) {
            this.editingTaskId = task.id;
            this.editedTaskTitle = task.title;
            this.editedTaskTagsInput = task.tags.join(', ');
        },

        saveEditedTask(taskId: string) {
            if (!this.currentProject) return;

            const task = this.findTaskById(taskId, this.currentProject.tasks);
            if (task && this.editedTaskTitle.trim()) {
                task.title = this.editedTaskTitle.trim();
                const newTags = this.parseTags(this.editedTaskTagsInput);
                task.tags = newTags;
                task.updatedAt = new Date();

                this.editingTaskId = null;
                this.editedTaskTitle = '';
                this.editedTaskTagsInput = '';
                this.saveData();
            }
        },

        cancelEditing() {
            this.editingTaskId = null;
            this.editedTaskTitle = '';
            this.editedTaskTagsInput = '';
        },

        findTaskById(id: string, tasks: Task[]): Task | undefined {
            for (const task of tasks) {
                if (task.id === id) return task;
                const found = this.findTaskById(id, task.subtasks);
                if (found) return found;
            }
            return undefined;
        },

        updateTaskStatus(taskId: string, newStatus: Task['status']) {
            if (!this.currentProject) return;

            const task = this.findTaskById(taskId, this.currentProject.tasks);
            if (task) {
                task.status = newStatus;
                task.updatedAt = new Date();
                this.saveData();
            }
        },

        deleteTask(taskId: string) {
            if (!this.currentProject) return;

            const deleteFromList = (tasks: Task[]): boolean => {
                const index = tasks.findIndex((t) => t.id === taskId);
                if (index !== -1) {
                    tasks.splice(index, 1);
                    return true;
                }
                // Ищем в подзадачах
                for (const t of tasks) {
                    if (deleteFromList(t.subtasks)) return true;
                }
                return false;
            };

            if (deleteFromList(this.currentProject.tasks)) {
                this.saveData();
            }
        },

        toggleSubtasks(taskId: string) {
            this.showSubtasksForTaskId = this.showSubtasksForTaskId === taskId ? null : taskId;
        },

        addSubtask(parentTaskId: string, title: string) {
            if (!title.trim() || !this.currentProject) return;

            const parentTask = this.findTaskById(parentTaskId, this.currentProject.tasks);
            if (parentTask) {
                const newSubtask = this.createNewTask(title.trim());
                parentTask.subtasks.push(newSubtask);
                this.saveData();
            }
        },

        resetFilters() {
            this.appData.filters = getInitialData().filters;
            this.saveData();
        },

    },
});