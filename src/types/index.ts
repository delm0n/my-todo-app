// src/types/index.ts

export interface Task {
    id: string; // UUID
    title: string;
    status: 'todo' | 'in-progress' | 'done';
    tags: string[];
    subtasks: Task[]; // Подзадачи тоже являются Task
    createdAt: Date;
    updatedAt: Date;
}

export interface Project {
    id: string; // UUID
    name: string;
    tasks: Task[];
}

// Тип для хранения фильтров, как указано в ТЗ, раздел 5
export interface AppFilters {
    statuses: Task['status'][]; // Массив возможных статусов
    tags: string[];             // Массив тегов
    search: string;             // Строка поиска
}

// Основная структура данных для LocalStorage
export interface AppData {
    projects: Project[];
    filters: AppFilters;
}