<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Search, Tag, Trash2, Edit3 } from 'lucide-vue-next'
import { useLoreStore } from '@/stores/domain/loreStore'
import type { WorldRule } from '@/types'

const loreStore = useLoreStore()
const searchQuery = ref('')
const selectedCategory = ref<string>('all')
const showCreateModal = ref(false)
const editingRule = ref<WorldRule | null>(null)

// 表单数据
const formData = ref({
  name: '',
  category: '修炼体系',
  description: '',
  constraints: [] as string[],
  tags: [] as string[],
})

const categories = computed(() => {
  const cats = new Set(loreStore.worldRules.map(r => r.category))
  return ['all', ...Array.from(cats)]
})

const filteredRules = computed(() => {
  let rules = loreStore.worldRules
  
  if (selectedCategory.value !== 'all') {
    rules = rules.filter(r => r.category === selectedCategory.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    rules = rules.filter(r => 
      r.name.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query)
    )
  }
  
  return rules
})

function resetForm() {
  formData.value = {
    name: '',
    category: '修炼体系',
    description: '',
    constraints: [],
    tags: [],
  }
  editingRule.value = null
}

function openCreateModal() {
  resetForm()
  showCreateModal.value = true
}

function openEditModal(rule: WorldRule) {
  editingRule.value = rule
  formData.value = {
    name: rule.name,
    category: rule.category,
    description: rule.description,
    constraints: [...rule.constraints],
    tags: [...rule.tags],
  }
  showCreateModal.value = true
}

async function saveRule() {
  if (!formData.value.name.trim()) return
  
  const projectId = 'default-project' // TODO: 从当前项目获取
  
  if (editingRule.value) {
    await loreStore.updateWorldRule(editingRule.value.id, {
      name: formData.value.name,
      category: formData.value.category,
      description: formData.value.description,
      constraints: formData.value.constraints,
      tags: formData.value.tags,
    })
  } else {
    await loreStore.createWorldRule({
      name: formData.value.name,
      category: formData.value.category,
      description: formData.value.description,
      constraints: formData.value.constraints,
      tags: formData.value.tags,
    }, projectId)
  }
  
  showCreateModal.value = false
  resetForm()
}

async function deleteRule(rule: WorldRule) {
  if (!confirm(`确定要删除法则 "${rule.name}" 吗？`)) return
  await loreStore.deleteWorldRule(rule.id)
}

function addConstraint() {
  formData.value.constraints.push('')
}

function removeConstraint(index: number) {
  formData.value.constraints.splice(index, 1)
}

function addTag() {
  const tag = prompt('输入标签名：')
  if (tag && !formData.value.tags.includes(tag)) {
    formData.value.tags.push(tag)
  }
}

function removeTag(tag: string) {
  const index = formData.value.tags.indexOf(tag)
  if (index > -1) {
    formData.value.tags.splice(index, 1)
  }
}
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-border p-3">
      <h2 class="text-sm font-semibold">世界观法则</h2>
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
          placeholder="搜索法则..."
          class="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      
      <!-- Category Filter -->
      <select
        v-model="selectedCategory"
        class="h-7 w-full rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="all">全部分类</option>
        <option v-for="cat in categories.filter(c => c !== 'all')" :key="cat" :value="cat">
          {{ cat }}
        </option>
      </select>
    </div>

    <!-- Rules List -->
    <div class="flex-1 overflow-y-auto p-2">
      <div v-if="filteredRules.length === 0" class="py-8 text-center text-sm text-muted-foreground">
        <Tag class="mx-auto mb-2 h-8 w-8 opacity-50" />
        <p>暂无世界观法则</p>
      </div>
      
      <div v-else class="space-y-2">
        <div
          v-for="rule in filteredRules"
          :key="rule.id"
          class="group rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/50 hover:shadow-sm"
        >
          <div class="mb-1 flex items-start justify-between">
            <h4 class="font-medium text-foreground">{{ rule.name }}</h4>
            <div class="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                @click="openEditModal(rule)"
                class="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Edit3 class="h-3.5 w-3.5" />
              </button>
              <button
                @click="deleteRule(rule)"
                class="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <p class="mb-2 text-xs text-muted-foreground line-clamp-2">{{ rule.description }}</p>
          <div class="flex flex-wrap gap-1">
            <span class="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground">
              {{ rule.category }}
            </span>
            <span
              v-for="tag in rule.tags.slice(0, 2)"
              :key="tag"
              class="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
            >
              {{ tag }}
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
          {{ editingRule ? '编辑法则' : '新建法则' }}
        </h3>
        
        <div class="space-y-4">
          <!-- Name -->
          <div>
            <label class="mb-1 block text-sm font-medium">法则名称</label>
            <input
              v-model="formData.name"
              type="text"
              placeholder="例如：灵气复苏"
              class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          
          <!-- Category -->
          <div>
            <label class="mb-1 block text-sm font-medium">分类</label>
            <select
              v-model="formData.category"
              class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option>修炼体系</option>
              <option>势力规则</option>
              <option>世界规则</option>
              <option>魔法系统</option>
              <option>科技法则</option>
              <option>其他</option>
            </select>
          </div>
          
          <!-- Description -->
          <div>
            <label class="mb-1 block text-sm font-medium">描述</label>
            <textarea
              v-model="formData.description"
              rows="3"
              placeholder="描述这个法则的具体内容..."
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          
          <!-- Constraints -->
          <div>
            <label class="mb-1 block text-sm font-medium">限制条件</label>
            <div class="space-y-2">
              <div
                v-for="(constraint, index) in formData.constraints"
                :key="index"
                class="flex gap-2"
              >
                <input
                  v-model="formData.constraints[index]"
                  type="text"
                  placeholder="例如：仅限元婴期以上修士"
                  class="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <button
                  @click="removeConstraint(index)"
                  class="rounded-md border border-input px-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
              <button
                @click="addConstraint"
                class="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Plus class="h-3 w-3" />
                添加限制条件
              </button>
            </div>
          </div>
          
          <!-- Tags -->
          <div>
            <label class="mb-1 block text-sm font-medium">标签</label>
            <div class="flex flex-wrap gap-1 mb-2">
              <span
                v-for="tag in formData.tags"
                :key="tag"
                class="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
              >
                {{ tag }}
                <button
                  @click="removeTag(tag)"
                  class="text-secondary-foreground/70 hover:text-secondary-foreground"
                >
                  ×
                </button>
              </span>
            </div>
            <button
              @click="addTag"
              class="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Plus class="h-3 w-3" />
              添加标签
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
            @click="saveRule"
            :disabled="!formData.name.trim()"
            class="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {{ editingRule ? '保存' : '创建' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
