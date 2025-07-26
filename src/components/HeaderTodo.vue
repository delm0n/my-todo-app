<script setup lang="ts">
import { ref, computed } from "vue";
import { encryptData, decryptData } from "../services/crypto.service";
import { useTodoStore } from "@/stores/todoStore";

const store = useTodoStore();

const encryptionKey = ref("");
const importFile = ref<File | null>(null);
const importError = ref<string | null>(null);

const isModalOpen = ref(false);
const modalMode = ref<"export" | "import">("export");

const modalTitle = computed(() => {
  return modalMode.value === "export" ? "Экспорт данных" : "Импорт данных";
});

const modalDescription = computed(() => {
  return modalMode.value === "export"
    ? "Введите ключ шифрования. Данные будут зашифрованы и сохранены в текстовый файл."
    : "Выберите файл с зашифрованными данными и введите ключ шифрования.";
});

const actionButtonText = computed(() => {
  return modalMode.value === "export" ? "Экспортировать" : "Импортировать";
});

// Открывает модальное окно для экспорта
const openExportModal = () => {
  modalMode.value = "export";
  isModalOpen.value = true;

  encryptionKey.value = "";
};

// Открывает модальное окно для импорта
const openImportModal = () => {
  modalMode.value = "import";
  isModalOpen.value = true;

  encryptionKey.value = "";
  importFile.value = null;
  importError.value = null;
};

// Закрывает модальное окно
const closeModal = () => {
  isModalOpen.value = false;
};

// Обработчик клика на фон (для закрытия)
const onBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal();
  }
};

const performExport = () => {
  if (!encryptionKey.value.trim()) {
    alert("Пожалуйста, введите ключ шифрования.");
    return;
  }

  try {
    const encryptedToken = encryptData(store.appData, encryptionKey.value);

    const blob = new Blob([encryptedToken], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `todo_export_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert("Данные успешно экспортированы и зашифрованы!");
  } catch (err) {
    console.error("Ошибка экспорта:", err);
    alert("Произошла ошибка при экспорте данных.");
  } finally {
    closeModal();
  }
};

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    importFile.value = target.files[0];
  } else {
    importFile.value = null;
  }
};

const performImport = async () => {
  if (!importFile.value) {
    importError.value = "Пожалуйста, выберите файл.";
    return;
  }
  if (!encryptionKey.value.trim()) {
    importError.value = "Пожалуйста, введите ключ шифрования.";
    return;
  }

  try {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const encryptedContent = e.target?.result as string;
      if (!encryptedContent) {
        importError.value = "Не удалось прочитать файл.";
        return;
      }

      const decryptedData = decryptData(encryptedContent, encryptionKey.value);

      if (decryptedData) {
        store.appData = decryptedData;
        store.saveData();
        alert("Данные успешно импортированы!");
      } else {
        importError.value =
          "Не удалось расшифровать данные. Проверьте ключ или файл.";
      }
    };
    fileReader.onerror = () => {
      importError.value = "Ошибка при чтении файла.";
    };
    fileReader.readAsText(importFile.value);
  } catch (err) {
    console.error("Ошибка импорта:", err);
    importError.value = "Произошла ошибка при импорте данных.";
  }
};
</script>

<template>
  <div>
    <header class="mb-6 text-center">
      <h1 class="text-3xl font-bold text-gray-800 mt-4">Vue 3 ToDo-лист</h1>
      <p class="text-gray-600">
        ToDo-лист с мультитиповыми статусами, тегами и шифрованным экспортом
      </p>

      <div class="mt-4 flex justify-center space-x-4">
        <button
          @click="openExportModal"
          class="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300 text-sm"
        >
          Экспортировать
        </button>
        <button
          @click="openImportModal"
          class="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 text-sm"
        >
          Импортировать
        </button>
      </div>
    </header>

    <div
      v-if="isModalOpen"
      @click="onBackdropClick"
      class="fixed inset-0 bg-gray-900/70 flex items-center justify-center p-4 z-50"
    >
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 ease-out scale-95 animate-fade-in-up"
        @click.stop=""
      >
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ modalTitle }}
          </h3>
          <p class="text-sm text-gray-500 mb-4">{{ modalDescription }}</p>

          <div v-if="modalMode === 'import'" class="mb-4">
            <input
              type="file"
              accept=".txt"
              @change="onFileChange"
              class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <input
            v-model="encryptionKey"
            type="password"
            placeholder="Ключ шифрования"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />

          <div
            v-if="modalMode === 'import' && importError"
            class="text-red-500 text-sm mb-4"
          >
            {{ importError }}
          </div>

          <div class="flex justify-end space-x-3">
            <button
              @click="closeModal"
              class="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-300 text-sm"
            >
              Отмена
            </button>
            <button
              v-if="modalMode === 'export'"
              @click="performExport"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300 text-sm"
            >
              {{ actionButtonText }}
            </button>
            <button
              v-else-if="modalMode === 'import'"
              @click="performImport"
              :disabled="!importFile || !encryptionKey.trim()"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 text-sm disabled:opacity-50"
            >
              {{ actionButtonText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.2s ease-out forwards;
}
</style>
