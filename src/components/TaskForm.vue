<template>
  <!-- Форма добавления задачи -->
  <div class="bg-white shadow rounded-lg p-4 mb-6">
    <div class="space-y-3">
      <input
        v-model="newTaskTitle"
        @keyup.enter="addToStore"
        type="text"
        placeholder="Введите новую задачу..."
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        v-model="newTaskTagsInput"
        type="text"
        placeholder="Теги (через запятую)..."
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div class="flex justify-end">
        <button
          @click="addToStore"
          :disabled="!newTaskTitle.trim()"
          class="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
        >
          Добавить задачу
        </button>
      </div>
    </div>
  </div>
</template>

<!-- src/App.vue -->
<script setup lang="ts">
import { ref, onMounted, watch } from "vue";

import { useTodoStore } from "@/stores/todoStore";
const store = useTodoStore();

// Состояние для новой задачи
const newTaskTitle = ref("");
const newTaskTagsInput = ref(""); // Для ввода тегов новой задачи

const addToStore = () => {
  store.addTask(newTaskTitle.value, newTaskTagsInput.value);
  newTaskTitle.value = "";
  newTaskTagsInput.value = ""; // Для ввода тегов новой задачи
};
</script>
