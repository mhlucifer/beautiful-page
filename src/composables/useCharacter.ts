import { ref, computed } from 'vue'
import { useCharacterStore } from '@/stores/domain/characterStore'
import { useToast } from '@/components/ui/toast/use-toast'
import type { CharacterFormData, Character } from '@/types'

export interface UseCharacterOptions {
  showToast?: boolean
  autoRetry?: number
}

export function useCharacter(options: UseCharacterOptions = {}) {
  const { showToast = true, autoRetry = 3 } = options
  
  const characterStore = useCharacterStore()
  const { toast } = useToast()
  
  // Local state
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const currentOperation = ref<string>('')
  
  // Cancel token for race condition prevention
  let cancelToken = 0
  
  // ============ Helper Functions ============
  
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
  
  function showSuccess(message: string) {
    if (showToast) {
      toast({
        title: '成功',
        description: message,
        variant: 'default',
      })
    }
  }
