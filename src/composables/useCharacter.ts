import { ref, computed } from 'vue'
import { useCharacterStore } from '@/stores/domain/characterStore'
import type { CharacterFormData, Character } from '@/types'

export interface UseCharacterOptions {
  showToast?: boolean
  autoRetry?: number
}

export function useCharacter(options: UseCharacterOptions = {}) {
  const { showToast = true, autoRetry = 3 } = options
  
  const characterStore = useCharacterStore()
  
  // Local state
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const currentOperation = ref<string>('')
  
  // Cancel token for race condition prevention
  let cancelToken = 0
  
  // Helper Functions
  function validateData(data: CharacterFormData): string | null {
    if (!data.name || data.name.trim() === '') {
      return '角色名称不能为空'
    }
    if (data.name.length > 50) {
      return '角色名称不能超过50个字符'
    }
    if (!data.identity || data.identity.trim() === '') {
      return '角色身份不能为空'
    }
    return null
  }
  
  async function withRetry<T>(
    fn: () => Promise<T>,
    retries: number
  ): Promise<T> {
    let lastError: Error | null = null
    
    for (let i = 0; i < retries; i++) {
      try {
        return await fn()
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        }
      }
    }
    
    throw lastError
  }
  
  // Main Actions
  async function createCharacter(data: CharacterFormData, projectId: string): Promise<Character | null> {
    const operationId = ++cancelToken
    currentOperation.value = 'create'
    isLoading.value = true
    error.value = null
    
    // 表单校验
    const validationError = validateData(data)
    if (validationError) {
      error.value = new Error(validationError)
      isLoading.value = false
      return null
    }
    
    try {
      const newCharacter = await withRetry(
        () => characterStore.createCharacter(data, projectId),
        autoRetry
      )
      
      if (operationId !== cancelToken) {
        return null
      }
      
      return newCharacter
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建角色失败'
      error.value = new Error(errorMessage)
      return null
    } finally {
      if (operationId === cancelToken) {
        isLoading.value = false
        currentOperation.value = ''
      }
    }
  }
  
  return {
    isLoading,
    error,
    currentOperation,
    createCharacter,
  }
}
