<!-- src/App.vue -->
<script setup lang="ts">
import { ref, onMounted, watch } from "vue";

import { useTodoStore } from "@/stores/todoStore";
import HeaderTodo from "./components/HeaderTodo.vue";
import TaskForm from "./components/TaskForm.vue";
import Filter from "./components/Filter.vue";
import TaskItem from "./components/TaskItem.vue";

const store = useTodoStore();

// --- Жизненный цикл ---
onMounted(() => {
  store.loadData();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-4xl mx-auto">
      <HeaderTodo />

      <div
        v-if="store.error"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
      >
        {{ store.error }}
      </div>

      <!-- Форма добавления задачи -->
      <TaskForm />

      <!-- Панель фильтров и поиска -->
      <Filter />

      <!-- Список задач -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div v-if="store.isLoading" class="p-4 text-center text-gray-500">
          Загрузка...
        </div>
        <div v-else>
          <div
            v-if="store.filteredTasks.length === 0"
            class="p-4 text-center text-gray-500"
          >
            Задачи не найдены. Добавьте первую задачу или измените фильтры!
          </div>
          <ul v-else>
            <TaskItem
              v-for="task in store.filteredTasks"
              :key="task.id"
              :task="task"
            />
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
