import type { AppData, Project, Task } from '@/types'; // <-- Добавлено 'type' перед импортируемыми именами

// Ключ для хранения данных в localStorage
const STORAGE_KEY = 'todo_app_data';

/**
 * Преобразует объект Task (и его подзадачи) из JSON
 * @param taskObj Объект задачи из JSON
 * @returns Объект Task с Date
 */
function deserializeTask(taskObj: any): Task {
    const task: Task = {
        ...taskObj,
        createdAt: new Date(taskObj.createdAt),
        updatedAt: new Date(taskObj.updatedAt),
        subtasks: [], // Инициализируем пустой массив
    };

    // Рекурсивно десериализуем подзадачи
    if (Array.isArray(taskObj.subtasks)) {
        task.subtasks = taskObj.subtasks.map(deserializeTask);
    }

    return task;
}

/**
 * Преобразует объект Task (и его подзадачи) в JSON
 * @param task Объект Task
 * @returns Объект задачи, готовый для JSON.stringify
 */
function serializeTask(task: Task): any {
    return {
        ...task,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        subtasks: task.subtasks.map(serializeTask), // Рекурсивно сериализуем подзадачи
    };
}

/**
 * Преобразует объект Project (и его задачи) из JSON
 * @param projectObj Объект проекта из JSON
 * @returns Объект Project
 */
function deserializeProject(projectObj: any): Project {
    return {
        ...projectObj,
        tasks: Array.isArray(projectObj.tasks) ? projectObj.tasks.map(deserializeTask) : [],
    };
}

/**
 * Преобразует объект Project (и его задачи) в JSON.
 * @param project Объект Project
 * @returns Объект проекта, готовый для JSON.stringify
 */
function serializeProject(project: Project): any {
    return {
        ...project,
        tasks: project.tasks.map(serializeTask),
    };
}

/**
 * Загружает данные из localStorage.
 * @returns Объект AppData или null, если данных нет или они повреждены.
 */
export function loadFromStorage(): AppData | null {
    try {
        const dataStr = localStorage.getItem(STORAGE_KEY);
        if (!dataStr) {
            return null;
        }

        const parsedData = JSON.parse(dataStr);

        // Проверка базовой структуры
        if (!parsedData || typeof parsedData !== 'object') {
            console.warn('Некорректная структура данных в localStorage');
            return null;
        }

        const appData: AppData = {
            projects: [],
            filters: {
                statuses: ['todo', 'in-progress', 'done'],
                tags: [],
                search: '',
            },
        };

        // Десериализация проектов
        if (Array.isArray(parsedData.projects)) {
            appData.projects = parsedData.projects.map(deserializeProject);
        }

        // Загрузка фильтров, если они есть
        if (parsedData.filters && typeof parsedData.filters === 'object') {
            appData.filters = {
                ...appData.filters, // Значения по умолчанию
                ...parsedData.filters, // Перезаписываем значениями из storage
                // Убеждаемся, что массивы и строки корректны
                statuses: Array.isArray(parsedData.filters.statuses) ? parsedData.filters.statuses : appData.filters.statuses,
                tags: Array.isArray(parsedData.filters.tags) ? parsedData.filters.tags : appData.filters.tags,
                search: typeof parsedData.filters.search === 'string' ? parsedData.filters.search : appData.filters.search,
            };
        }

        return appData;
    } catch (error) {
        console.error('Ошибка при загрузке данных из localStorage:', error);
        return null; // Возвращаем null в случае ошибки парсинга
    }
}

/**
 * Сохраняет данные в localStorage.
 * @param data Объект AppData для сохранения.
 */
export function saveToStorage(data: AppData): void { // <-- Также исправлена опечатка в сигнатуре функции
    try {
        // Сериализуем данные перед сохранением
        const serializableData = {
            projects: data.projects.map(serializeProject),
            filters: data.filters,
        };

        const dataStr = JSON.stringify(serializableData);
        localStorage.setItem(STORAGE_KEY, dataStr);
    } catch (error) {
        console.error('Ошибка при сохранении данных в localStorage:', error);
        // В production приложении здесь можно было бы показать пользователю уведомление
    }
}

/**
 * Предоставляет начальные данные по умолчанию.
 * @returns Объект AppData с начальными значениями.
 */
export function getInitialData(): AppData {
    return {
        projects: [],
        filters: {
            statuses: ['todo', 'in-progress', 'done'],
            tags: [],
            search: '',
        },
    };
}