<script setup lang="ts">
import type { Task } from "../types";
import { useTodoStore } from "@/stores/todoStore";

const store = useTodoStore();
</script>

<template>
  <div class="bg-white shadow rounded-lg p-4 mb-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label
          for="search-input"
          class="block text-sm font-medium text-gray-700 mb-1"
          >Поиск</label
        >
        <input
          id="search-input"
          v-model="store.appData.filters.search"
          type="text"
          placeholder="Поиск по названию..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Статусы</label
        >
        <div class="space-y-1">
          <label
            v-for="status in ['todo', 'in-progress', 'done']"
            :key="status"
            class="cursor-pointer flex items-center"
          >
            <input
              type="checkbox"
              :checked="store.appData.filters.statuses.includes(status as Task['status'])"
              @change="
                    () => {
                      const index = store.appData.filters.statuses.indexOf(status as Task['status']);
                      if (index > -1) {
                        store.appData.filters.statuses.splice(index, 1);
                      } else {
                        store.appData.filters.statuses.push(status as Task['status']);
                      }
                    }
                  "
              class="rounded text-purple-600 focus:ring-purple-500"
            />
            <span class="ml-2 text-sm text-gray-700 capitalize">
              {{ status === "in-progress" ? "In Progress" : status }}
            </span>
          </label>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Теги</label>
        <div
          v-if="store.allTagsInProject.length > 0"
          class="space-y-1 max-h-32 overflow-y-auto pr-2"
        >
          <label
            v-for="tag in store.allTagsInProject"
            :key="tag"
            class="flex items-center"
          >
            <input
              type="checkbox"
              :checked="store.appData.filters.tags.includes(tag)"
              @change="
                () => {
                  const index = store.appData.filters.tags.indexOf(tag);
                  if (index > -1) {
                    store.appData.filters.tags.splice(index, 1);
                  } else {
                    store.appData.filters.tags.push(tag);
                  }
                }
              "
              class="rounded text-purple-600 focus:ring-purple-500"
            />
            <span class="ml-2 text-sm text-gray-700 break-words">{{
              tag
            }}</span>
          </label>
        </div>
        <div v-else class="text-sm text-gray-500 italic">
          Нет доступных тегов
        </div>
      </div>
    </div>

    <div class="mt-4 flex justify-end">
      <button
        @click="store.resetFilters"
        class="cursor-pointer px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-300 text-sm"
      >
        Сбросить фильтры
      </button>
    </div>
  </div>
</template>
