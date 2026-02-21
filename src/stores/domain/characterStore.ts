import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/db/database'
import type { Character, CharacterFormData, EmotionalState } from '@/types'

export const useCharacterStore = defineStore('character', () => {
  // State
  const characters = ref<Character[]>([])
  const currentCharacter = ref<Character | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const charactersCount = computed(() => characters.value.length)
  
  const charactersByProject = computed(() => {
    const grouped = new Map<string, Character[]>()
    characters.value.forEach(char => {
      const list = grouped.get(char.projectId) || []
      list.push(char)
      grouped.set(char.projectId, list)
    })
    return grouped
  })

  // Actions
  async function loadCharacters(projectId?: string) {
    isLoading.value = true
    error.value = null
    
    try {
      if (projectId) {
        characters.value = await db.characters
          .where('projectId')
          .equals(projectId)
          .toArray()
      } else {
        characters.value = await db.characters.toArray()
      }
    } catch (err) {
      console.error('Failed to load characters:', err)
      error.value = '加载角色失败'
    } finally {
      isLoading.value = false
    }
  }

  async function createCharacter(data: CharacterFormData, projectId: string): Promise<Character> {
    const now = Date.now()
    
    // 创建完整的 emotionalState，避免 Partial 类型问题
    const emotionalState: EmotionalState = {
      currentMood: data.emotionalState?.currentMood || '',
      relationships: data.emotionalState?.relationships || [],
      mentalDefense: data.emotionalState?.mentalDefense ?? 50,
    }
    
    const newCharacter: Character = {
      id: crypto.randomUUID(),
      projectId,
      name: data.name,
      identity: data.identity,
      personality: data.personality,
      currentKnowledge: data.currentKnowledge || [],
      assets: data.assets || [],
      emotionalState,
      history: [],
      createdAt: now,
      updatedAt: now,
    }

    await db.characters.add(newCharacter)
    characters.value.push(newCharacter)
    
    return newCharacter
  }

  async function updateCharacter(id: string, updates: Partial<CharacterFormData>) {
    const character = characters.value.find(c => c.id === id)
    if (!character) throw new Error('Character not found')

    // 处理 emotionalState 更新
    let emotionalState = character.emotionalState
    if (updates.emotionalState) {
      emotionalState = {
        ...character.emotionalState,
        ...updates.emotionalState,
      }
    }

    const updated: Character = {
      ...character,
      ...updates,
      emotionalState,
      updatedAt: Date.now(),
    }

    await db.characters.update(id, updated)
    
    const index = characters.value.findIndex(c => c.id === id)
    if (index !== -1) {
      characters.value[index] = updated
    }
    
    if (currentCharacter.value?.id === id) {
      currentCharacter.value = updated
    }
  }

  async function deleteCharacter(id: string) {
    await db.characters.delete(id)
    characters.value = characters.value.filter(c => c.id !== id)
    
    if (currentCharacter.value?.id === id) {
      currentCharacter.value = null
    }
  }

  function setCurrentCharacter(character: Character | null) {
    currentCharacter.value = character
  }

  return {
    // State
    characters,
    currentCharacter,
    isLoading,
    error,
    
    // Getters
    charactersCount,
    charactersByProject,
    
    // Actions
    loadCharacters,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    setCurrentCharacter,
  }
})
