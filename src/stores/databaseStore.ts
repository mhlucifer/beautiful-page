import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, initDatabase } from '@/db/database'

export const useDatabaseStore = defineStore('database', () => {
  const isInitialized = ref(false)
  const isInitializing = ref(false)
  const error = ref<string | null>(null)
  const lastError = ref<Error | null>(null)

  async function initialize(): Promise<void> {
    if (isInitialized.value) return
    if (isInitializing.value) {
      // Wait for existing initialization
      while (isInitializing.value) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      if (isInitialized.value) return
    }

    isInitializing.value = true
    error.value = null
    lastError.value = null

    try {
      await initDatabase()
      isInitialized.value = true
      console.log('[DatabaseStore] Database initialized successfully')
    } catch (err) {
      console.error('[DatabaseStore] Failed to initialize database:', err)
      lastError.value = err instanceof Error ? err : new Error(String(err))
      error.value = lastError.value.message
      throw lastError.value
    } finally {
      isInitializing.value = false
    }
  }

  async function reset(): Promise<void> {
    try {
      await db.delete()
      isInitialized.value = false
      await initialize()
    } catch (err) {
      console.error('[DatabaseStore] Failed to reset database:', err)
      throw err
    }
  }

  function getDatabase() {
    if (!isInitialized.value) {
      throw new Error('Database not initialized. Call initialize() first.')
    }
    return db
  }

  return {
    // State
    isInitialized,
    isInitializing,
    error,
    lastError,

    // Actions
    initialize,
    reset,
    getDatabase,
  }
})
