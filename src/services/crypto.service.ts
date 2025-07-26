
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import type { AppData } from '@/types'; // Убедитесь, что путь правильный

/**
 * Шифрует данные приложения с использованием AES.
 * @param data Данные для шифрования (AppData).
 * @param secretKey Секретный ключ (пароль) для шифрования.
 * @returns Зашифрованная строка (токен).
 */
export function encryptData(data: AppData, secretKey: string): string {
    try {
        // Сначала сериализуем AppData в JSON-строку
        // Убедимся, что даты сериализуются корректно
        const serializableData = {
            ...data,
            projects: data.projects.map(p => ({
                ...p,
                tasks: p.tasks.map(function serializeTask(t: any) { // Используем named function для рекурсии
                    return {
                        ...t,
                        createdAt: t.createdAt.toISOString(),
                        updatedAt: t.updatedAt.toISOString(),
                        subtasks: t.subtasks.map(serializeTask),
                    };
                }),
            })),
        };

        const jsonData = JSON.stringify(serializableData);
        // Шифруем JSON-строку
        const ciphertext = AES.encrypt(jsonData, secretKey);
        // Возвращаем зашифрованную строку
        return ciphertext.toString();
    } catch (error) {
        console.error("Ошибка при шифровании данных:", error);
        throw new Error("Не удалось зашифровать данные.");
    }
}

/**
 * Расшифровывает данные приложения с использованием AES.
 * @param encryptedData Зашифрованная строка (токен).
 * @param secretKey Секретный ключ (пароль) для расшифровки.
 * @returns Расшифрованные данные (AppData) или null в случае ошибки.
 */
export function decryptData(encryptedData: string, secretKey: string): AppData | null {
    try {
        // Расшифровываем строку
        const bytes = AES.decrypt(encryptedData, secretKey);
        const decryptedDataString = bytes.toString(Utf8);

        if (!decryptedDataString) {
            console.warn("Расшифровка вернула пустую строку.");
            return null;
        }

        // Парсим JSON
        const parsedData = JSON.parse(decryptedDataString);

        // Десериализуем даты
        const appData: AppData = {
            ...parsedData,
            projects: Array.isArray(parsedData.projects) ? parsedData.projects.map((p: any) => ({
                ...p,
                tasks: Array.isArray(p.tasks) ? p.tasks.map(function deserializeTask(t: any) { // Используем named function для рекурсии
                    return {
                        ...t,
                        createdAt: new Date(t.createdAt),
                        updatedAt: new Date(t.updatedAt),
                        subtasks: Array.isArray(t.subtasks) ? t.subtasks.map(deserializeTask) : [],
                    };
                }) : [],
            })) : [],
            // Убедимся, что filters имеет правильную структуру
            filters: {
                statuses: ['todo', 'in-progress', 'done'],
                tags: [],
                search: '',
                ...parsedData.filters
            }
        };

        return appData;
    } catch (error) {
        console.error("Ошибка при расшифровке данных:", error);
        return null;
    }
}