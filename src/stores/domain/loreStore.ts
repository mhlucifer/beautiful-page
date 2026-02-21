import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/db/database'
import type { WorldRule, Faction, FactionRelationship } from '@/types'

export const useLoreStore = defineStore('lore', () => {
  // State
  const worldRules = ref<WorldRule[]>([])
  const factions = ref<Faction[]>([])
  const currentRule = ref<WorldRule | null>(null)
  const currentFaction = ref<Faction | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const rulesByCategory = computed(() => {
    const grouped = new Map<string, WorldRule[]>()
    worldRules.value.forEach(rule => {
      const list = grouped.get(rule.category) || []
      list.push(rule)
      grouped.set(rule.category, list)
    })
    return grouped
  })

  const factionsByType = computed(() => {
    const grouped = new Map<string, Faction[]>()
    factions.value.forEach(faction => {
      // 简单分类：正道/魔道/中立
      let type = '中立'
      if (faction.ideology.includes('天道') || faction.ideology.includes('正义')) {
        type = '正道'
      } else if (faction.ideology.includes('强者为尊') || faction.ideology.includes('魔')) {
        type = '魔道'
      }
      const list = grouped.get(type) || []
      list.push(faction)
      grouped.set(type, list)
    })
    return grouped
  })

  // Actions - World Rules
  async function loadWorldRules(projectId?: string) {
    isLoading.value = true
    error.value = null
    
    try {
      if (projectId) {
        worldRules.value = await db.worldRules
          .where('projectId')
          .equals(projectId)
          .toArray()
      } else {
        worldRules.value = await db.worldRules.toArray()
      }
    } catch (err) {
      console.error('Failed to load world rules:', err)
      error.value = '加载世界观法则失败'
    } finally {
      isLoading.value = false
    }
  }

  async function createWorldRule(data: {
    name: string
    category: string
    description: string
    constraints?: string[]
    examples?: string[]
    tags?: string[]
  }, projectId: string): Promise<WorldRule> {
    const now = Date.now()
    const newRule: WorldRule = {
      id: crypto.randomUUID(),
      projectId,
      name: data.name,
      category: data.category,
      description: data.description,
      constraints: data.constraints || [],
      examples: data.examples || [],
      tags: data.tags || [],
      createdAt: now,
      updatedAt: now,
    }

    await db.worldRules.add(newRule)
    worldRules.value.push(newRule)
    
    return newRule
  }

  async function updateWorldRule(id: string, updates: Partial<WorldRule>) {
    const rule = worldRules.value.find(r => r.id === id)
    if (!rule) throw new Error('World rule not found')

    const updated = {
      ...rule,
      ...updates,
      updatedAt: Date.now(),
    }

    await db.worldRules.update(id, updated)
    
    const index = worldRules.value.findIndex(r => r.id === id)
    if (index !== -1) {
      worldRules.value[index] = updated
    }
    
    if (currentRule.value?.id === id) {
      currentRule.value = updated
    }
  }

  async function deleteWorldRule(id: string) {
    await db.worldRules.delete(id)
    worldRules.value = worldRules.value.filter(r => r.id !== id)
    
    if (currentRule.value?.id === id) {
      currentRule.value = null
    }
  }

  // Actions - Factions
  async function loadFactions(projectId?: string) {
    isLoading.value = true
    error.value = null
    
    try {
      if (projectId) {
        factions.value = await db.factions
          .where('projectId')
          .equals(projectId)
          .toArray()
      } else {
        factions.value = await db.factions.toArray()
      }
    } catch (err) {
      console.error('Failed to load factions:', err)
      error.value = '加载势力失败'
    } finally {
      isLoading.value = false
    }
  }

  async function createFaction(data: {
    name: string
    ideology: string
    resources?: string[]
  }, projectId: string): Promise<Faction> {
    const now = Date.now()
    const newFaction: Faction = {
      id: crypto.randomUUID(),
      projectId,
      name: data.name,
      ideology: data.ideology,
      relationships: [],
      members: [],
      resources: data.resources || [],
      createdAt: now,
      updatedAt: now,
    }

    await db.factions.add(newFaction)
    factions.value.push(newFaction)
    
    return newFaction
  }

  async function updateFaction(id: string, updates: Partial<Faction>) {
    const faction = factions.value.find(f => f.id === id)
    if (!faction) throw new Error('Faction not found')

    const updated = {
      ...faction,
      ...updates,
      updatedAt: Date.now(),
    }

    await db.factions.update(id, updated)
    
    const index = factions.value.findIndex(f => f.id === id)
    if (index !== -1) {
      factions.value[index] = updated
    }
    
    if (currentFaction.value?.id === id) {
      currentFaction.value = updated
    }
  }

  async function deleteFaction(id: string) {
    await db.factions.delete(id)
    factions.value = factions.value.filter(f => f.id !== id)
    
    if (currentFaction.value?.id === id) {
      currentFaction.value = null
    }
  }

  async function addFactionRelationship(
    factionId: string,
    relationship: FactionRelationship
  ) {
    const faction = factions.value.find(f => f.id === factionId)
    if (!faction) throw new Error('Faction not found')

    const updatedRelationships = [...faction.relationships, relationship]
    await updateFaction(factionId, { relationships: updatedRelationships })
  }

  // Setters
  function setCurrentRule(rule: WorldRule | null) {
    currentRule.value = rule
  }

  function setCurrentFaction(faction: Faction | null) {
    currentFaction.value = faction
  }

  return {
    // State
    worldRules,
    factions,
    currentRule,
    currentFaction,
    isLoading,
    error,
    
    // Getters
    rulesByCategory,
    factionsByType,
    
    // Actions - World Rules
    loadWorldRules,
    createWorldRule,
    updateWorldRule,
    deleteWorldRule,
    setCurrentRule,
    
    // Actions - Factions
    loadFactions,
    createFaction,
    updateFaction,
    deleteFaction,
    addFactionRelationship,
    setCurrentFaction,
  }
})
