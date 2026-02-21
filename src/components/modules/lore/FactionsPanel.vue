<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Search, Users, Trash2, Edit3, Shield } from 'lucide-vue-next'
import { useLoreStore } from '@/stores/domain/loreStore'
import type { Faction } from '@/types'

const loreStore = useLoreStore()
const searchQuery = ref('')
const selectedType = ref<string>('all')
const showCreateModal = ref(false)
const editingFaction = ref<Faction | null>(null)

// 表单数据
const formData = ref({
  name: '',
  ideology: '',
  resources: [] as string[],
})

const factionTypes = computed(() => {
  const types = new Set<string>()
  loreStore.factions.forEach(f => {
    if (f.ideology.includes('天道') || f.ideology.includes('正义')) {
      types.add('正道')
    } else if (f.ideology.includes('强者为尊') || f.ideology.includes('魔')) {
      types.add('魔道')
    } else {
      types.add('中立')
    }
  })
  return ['all', ...Array.from(types)]
})

const filteredFactions = computed(() => {
  let factions = loreStore.factions
  
  if (selectedType.value !== 'all') {
    factions = factions.filter(f => {
      if (selectedType.value === '正道') {
        return f.ideology.includes('天道') || f.ideology.includes('正义')
      } else if (selectedType.value === '魔道') {
        return f.ideology.includes('强者为尊') || f.ideology.includes('魔')
      } else {
        return !f.ideology.includes('天道') && !f.ideology.includes('正义') && 
               !f.ideology.includes('强者为尊') && !f.ideology.includes('魔')
      }
    })
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    factions = factions.filter(f => 
      f.name.toLowerCase().includes(query) ||
      f.ideology.toLowerCase().includes(query)
    )
  }
  
  return factions
})

function resetForm() {
  formData.value = {
    name: '',
    ideology: '',
    resources: [],
  }
  editingFaction.value = null
}

function openCreateModal() {
  resetForm()
  showCreateModal.value = true
}

function openEditModal(faction: Faction) {
  editingFaction.value = faction
  formData.value = {
    name: faction.name,
    ideology: faction.ideology,
    resources: [...faction.resources],
  }
  showCreateModal.value = true
}

async function saveFaction() {
  if (!formData.value.name.trim()) return
  
  const projectId = 'default-project' // TODO: 从当前项目获取
  
  if (editingFaction.value) {
    await loreStore.updateFaction(editingFaction.value.id, {
      name: formData.value.name,
      ideology: formData.value.ideology,
      resources: formData.value.resources,
    })
  } else {
    await loreStore.createFaction({
      name: formData.value.name,
      ideology: formData.value.ideology,
      resources: formData.value.resources,
    }, projectId)
  }
  
  showCreateModal.value = false
  resetForm()
}

async function deleteFaction(faction: Faction) {
  if (!confirm(`确定要删除势力 "${faction.name}" 吗？`)) return
  await loreStore.deleteFaction(faction.id)
}

function addResource() {
  const resource = prompt('输入资源名称：')
  if (resource && !formData.value.resources.includes(resource)) {
    formData.value.resources.push(resource)
  }
}

function removeResource(resource: string) {
  const index = formData.value.resources.indexOf(resource)
  if (index > -1) {
    formData.value.resources.splice(index, 1)
  }
}

function getFactionType(faction: Faction): { type: string; color: string } {
  if (faction.ideology.includes('天道') || faction.ideology.includes('正义')) {
    return { type: '正道', color: 'text-green-600 bg-green-100' }
  } else if (faction.ideology.includes('强者为尊') || faction.ideology.includes('魔')) {
    return { type: '魔道', color: 'text-red-600 bg-red-100' }
  }
  return { type: '中立', color: 'text-gray-600 bg-gray-100' }
}
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-border p-3">
      <h2 class="text-sm font-semibold">势力</h2>
      <button
        @click="openCreateModal"
        class="flex h-7 items-center gap-1 rounded-md bg-primary px-2 text-xs text-primary-foreground hover:bg-primary/90"
      >
        <Plus class="h-3.5 w-3.5" />
        新建
      </button>
    </div>

    <!-- Filters -->
    <div class="border-b border-border p-2 space-y-2">
      <!-- Search -->
      <div class="relative">
        <Search class="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索势力..."
          class="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      
      <!-- Type Filter -->
      <select
        v-model="selectedType"
        class="h-7 w-full rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="all">全部类型</option>
        <option value="正道">正道</option>
        <option value="魔道">魔道</option>
        <option value="中立">中立</option>
      </select>
    </div>

    <!-- Factions List -->
    <div class="flex-1 overflow-y-auto p-2">
      <div v-if="filteredFactions.length === 0" class="py-8 text-center text-sm text-muted-foreground">
        <Shield class="mx-auto mb-2 h-8 w-8 opacity-50" />
        <p>暂无势力</p>
      </div>
      
      <div v-else class="space-y-2">
        <div
          v-for="faction in filteredFactions"
          :key="faction.id"
          class="group rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/50 hover:shadow-sm"
        >
          <div class="mb-2 flex items-start justify-between">
            <div class="flex items-center gap-2">
              <Users class="h-4 w-4 text-muted-foreground" />
              <h4 class="font-medium text-foreground">{{ faction.name }}</h4>
            </div>
            <div class="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                @click="openEditModal(faction)"
                class="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Edit3 class="h-3.5 w-3.5" />
              </button>
              <button
                @click="deleteFaction(faction)"
                class="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          
          <p class="mb-2 text-xs text-muted-foreground line-clamp-2">{{ faction.ideology }}</p>
          
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="rounded px-1.5 py-0.5 text-[10px]"
              :class="getFactionType(faction).color"
            >
              {{ getFactionType(faction).type }}
            </span>
            <span
              v-for="resource in faction.resources.slice(0, 2)"
              :key="resource"
              class="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
            >
              {{ resource }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
        <h3 class="mb-4 text-lg font-semibold">
          {{ editingFaction ? '编辑势力' : '新建势力' }}
        </h3>
        
        <div class="space-y-4">
          <!-- Name -->
          <div>
            <label class="mb-1 block text-sm font-medium">势力名称</label>
            <input
              v-model="formData.name"
              type="text"
              placeholder="例如：天玄宗"
              class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          
          <!-- Ideology -->
          <div>
            <label class="mb-1 block text-sm font-medium">核心理念</label>
            <textarea
              v-model="formData.ideology"
              rows="2"
              placeholder="例如：顺应天道，清静无为"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          
          <!-- Resources -->
          <div>
            <label class="mb-1 block text-sm font-medium">资源/资产</label>
            <div class="flex flex-wrap gap-1 mb-2">
              <span
                v-for="resource in formData.resources"
                :key="resource"
                class="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
              >
                {{ resource }}
                <button
                  @click="removeResource(resource)"
                  class="text-secondary-foreground/70 hover:text-secondary-foreground"
                >
                  ×
                </button>
              </span>
            </div>
            <button
              @click="addResource"
              class="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Plus class="h-3 w-3" />
              添加资源
            </button>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="mt-6 flex justify-end gap-2">
          <button
            @click="showCreateModal = false"
            class="rounded-md border border-input px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
          >
            取消
          </button>
          <button
            @click="saveFaction"
            :disabled="!formData.name.trim()"
            class="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {{ editingFaction ? '保存' : '创建' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
