<!-- src/components/TaskItem.vue -->
<script setup lang="ts">
import { ref, computed } from "vue";
import type { Task } from "@/types";
import { useTodoStore } from "@/stores/todoStore";

// --- Props ---
const props = defineProps<{
  task: Task;
  // Укажем, что это задача верхнего уровня, если нужно отличать логику
  // isTopLevel?: boolean;
}>();

// --- Store ---
const store = useTodoStore();

// --- Local State ---
// Локальное состояние для ввода новой подзадачи для этой конкретной задачи
const localNewSubtaskTitle = ref("");

// --- Computed ---
const isSubtasksVisible = computed(
  () => store.showSubtasksForTaskId === props.task.id
);

// --- Methods ---
const handleAddSubtask = () => {
  if (localNewSubtaskTitle.value.trim()) {
    store.addSubtask(props.task.id, localNewSubtaskTitle.value.trim());
    localNewSubtaskTitle.value = "";
  }
};

const handleAddSubtaskOnEnter = (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    handleAddSubtask();
  }
};

const handleToggleSubtasks = () => {
  store.toggleSubtasks(props.task.id);
};

const handleDeleteTask = () => {
  // if (confirm(`Вы уверены, что хотите удалить задачу "${props.task.title}"?`)) {
  store.deleteTask(props.task.id);
  // }
};

const handleUpdateTaskStatus = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  store.updateTaskStatus(props.task.id, target.value as Task["status"]);
};

const handleStartEditing = () => {
  store.startEditing(props.task);
};

const handleSaveEditedTask = () => {
  store.saveEditedTask(props.task.id);
};

const handleCancelEditing = () => {
  store.cancelEditing();
};

// --- Handlers for Subtasks (Level 2) ---
// Эти обработчики будут использоваться для подзадач второго уровня
const handleDeleteSubtask = (subtaskId: string) => {
  store.deleteTask(subtaskId);
};

const handleUpdateSubtaskStatus = (subtaskId: string, event: Event) => {
  const target = event.target as HTMLSelectElement;
  store.updateTaskStatus(subtaskId, target.value as Task["status"]);
};
</script>

<template>
  <li class="border-b border-gray-200 last:border-b-0">
    <div class="p-4 hover:bg-gray-50 transition duration-150">
      <div class="flex items-start">
        <!-- Индикатор статуса -->
        <div
          class="flex-shrink-0 w-3 h-3 rounded-full mt-1.5 mr-3"
          :class="{
            'bg-yellow-500': task.status === 'todo',
            'bg-blue-500': task.status === 'in-progress',
            'bg-green-500': task.status === 'done',
          }"
        ></div>
        <!-- Содержимое задачи -->
        <div class="flex-grow">
          <!-- Редактирование заголовка и тегов -->
          <div v-if="store.editingTaskId === task.id" class="space-y-2">
            <input
              v-model="store.editedTaskTitle"
              type="text"
              class="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              autofocus
            />
            <input
              v-model="store.editedTaskTagsInput"
              type="text"
              placeholder="Теги (через запятую)..."
              class="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div class="flex space-x-2">
              <button
                @click="handleSaveEditedTask"
                class="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
              >
                Сохранить
              </button>
              <button
                @click="handleCancelEditing"
                class="px-3 py-1 bg-gray-300 text-gray-800 text-sm rounded hover:bg-gray-400"
              >
                Отмена
              </button>
            </div>
          </div>
          <!-- Отображение задачи -->
          <div v-else>
            <div
              @dblclick="handleStartEditing"
              class="cursor-pointer font-medium text-gray-800"
            >
              {{ task.title }}
            </div>
            <!-- Отображение тегов -->
            <div v-if="task.tags.length > 0" class="mt-1 flex flex-wrap gap-1">
              <span
                v-for="tag in task.tags"
                :key="tag"
                class="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
              >
                {{ tag }}
              </span>
            </div>
            <div class="text-xs text-gray-500 mt-1">
              Создано: {{ task.createdAt.toLocaleString() }}
            </div>
          </div>
        </div>
        <!-- Управление задачей -->
        <div class="flex-shrink-0 flex items-center space-x-2 ml-2">
          <!-- Выбор статуса -->
          <select
            :value="task.status"
            @change="handleUpdateTaskStatus"
            class="text-xs border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <!-- Кнопка показа/скрытия подзадач -->
          <button
            @click="handleToggleSubtasks"
            class="cursor-pointer text-gray-500 hover:text-gray-700"
            :title="
              isSubtasksVisible ? 'Скрыть подзадачи' : 'Показать подзадачи'
            "
          >
            <svg
              v-if="isSubtasksVisible"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          <!-- Кнопка удаления -->
          <button
            @click="handleDeleteTask"
            class="cursor-pointer text-red-500 hover:text-red-700"
            title="Удалить задачу"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
      <!-- Форма добавления подзадачи и список подзадач -->
      <div
        v-if="isSubtasksVisible"
        class="mt-3 pl-6 border-l-2 border-gray-200"
      >
        <!-- Форма добавления подзадачи -->
        <div class="mb-3">
          <div class="flex">
            <input
              v-model="localNewSubtaskTitle"
              @keyup="handleAddSubtaskOnEnter"
              type="text"
              placeholder="Новая подзадача..."
              class="flex-grow px-2 py-1 text-sm border border-gray-300 rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              @click="handleAddSubtask"
              :disabled="!localNewSubtaskTitle.trim()"
              class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-sm rounded-r disabled:opacity-50"
            >
              Добавить
            </button>
          </div>
        </div>
        <!-- Список подзадач  -->
        <div v-if="task.subtasks.length > 0">
          <ul class="space-y-2">
            <!-- Отображаем подзадачи второго уровня напрямую -->
            <li
              v-for="subtask in task.subtasks"
              :key="subtask.id"
              class="flex items-center text-sm"
            >
              <!-- Индикатор статуса подзадачи -->
              <div
                class="flex-shrink-0 w-2 h-2 rounded-full mr-2 mt-1.5"
                :class="{
                  'bg-yellow-500': subtask.status === 'todo',
                  'bg-blue-500': subtask.status === 'in-progress',
                  'bg-green-500': subtask.status === 'done',
                }"
              ></div>
              <!-- Заголовок подзадачи -->
              <span
                :class="{
                  'line-through text-gray-500': subtask.status === 'done',
                }"
              >
                {{ subtask.title }}
              </span>
              <!-- Выбор статуса подзадачи -->
              <select
                :value="subtask.status"
                @change="(e) => handleUpdateSubtaskStatus(subtask.id, e)"
                class="ml-2 text-xs border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <!-- Кнопка удаления подзадачи -->
              <button
                @click="() => handleDeleteSubtask(subtask.id)"
                class="cursor-pointer ml-2 text-red-400 hover:text-red-600"
                title="Удалить подзадачу"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </li>
          </ul>
        </div>
        <div v-else class="text-xs text-gray-500 italic">Нет подзадач.</div>
      </div>
    </div>
  </li>
</template>
