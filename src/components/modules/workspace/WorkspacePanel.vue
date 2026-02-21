<script setup lang="ts">
import { ref } from 'vue'
import { Zap, Send, Copy, Check, RefreshCw } from 'lucide-vue-next'
import EmptyState from '@/components/shared/EmptyState.vue'

const hasContent = ref(false)
const promptText = ref('')
const isCopied = ref(false)
const isGenerating = ref(false)

const contextItems = ref([
  { id: '1', label: '本章细纲', checked: true },
  { id: '2', label: '主角当前状态', checked: true },
  { id: '3', label: '世界观法则', checked: false },
  { id: '4', label: '上一章结尾', checked: true },
  { id: '5', label: '相关角色状态', checked: false },
])

function toggleItem(id: string) {
  const item = contextItems.value.find(i => i.id === id)
  if (item) {
    item.checked = !item.checked
  }
}

async function assemblePrompt() {
  isGenerating.value = true
  
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const checkedItems = contextItems.value.filter(i => i.checked)
  let prompt = '【AI 创作辅助 - 上下文组装】\n\n'
  
  checkedItems.forEach(item => {
    prompt += `[${item.label}]\n`
    prompt += `此处插入${item.label}的具体内容...\n\n`
  })
  
  prompt += '---\n\n'
  prompt += '【创作要求】\n'
  prompt += '请根据以上上下文，续写下一章节内容。注意保持人物性格一致性，情节逻辑连贯。'
  
  promptText.value = prompt
  hasContent.value = true
  isGenerating.value = false
}

async function copyPrompt() {
  await navigator.clipboard.writeText(promptText.value)
  isCopied.value = true
  setTimeout(() => isCopied.value = false, 2000)
}

function sendToAI() {
  console.log('Sending to AI:', promptText.value)
}

function resetWorkspace() {
  hasContent.value = false
  promptText.value = ''
  contextItems.value.forEach(item => item.checked = false)
}
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-border p-3">
      <div class="flex items-center gap-2">
        <Zap class="h-4 w-4 text-muted-foreground" />
        <span class="text-sm font-medium">AI 工作台</span>
      </div>
      <button
        v-if="hasContent"
        @click="resetWorkspace"
        class="flex h-7 items-center gap-1 rounded-md px-2 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <RefreshCw class="h-3.5 w-3.5" />
        重置
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto">
      <EmptyState
        v-if="!hasContent"
        icon="zap"
        title="AI 组装工作台"
        description="选择上下文内容，一键生成 AI Prompt"
        :actions="[
          { label: '开始组装', variant: 'default', onClick: assemblePrompt },
        ]"
      />
      <div v-else class="p-3 space-y-4">
        <!-- Context Selector -->
        <div class="rounded-lg border border-border bg-card">
          <div class="border-b border-border px-3 py-2">
            <h4 class="text-sm font-medium">选择上下文</h4>
          </div>
          <div class="p-2 space-y-1">
            <label
              v-for="item in contextItems"
              :key="item.id"
              class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-accent"
            >
              <input
                type="checkbox"
                :checked="item.checked"
                @change="toggleItem(item.id)"
                class="h-4 w-4 rounded border border-primary text-primary focus:ring-primary"
              />
              <span class="text-sm">{{ item.label }}</span>
            </label>
          </div>
        </div>

        <!-- Prompt Preview -->
        <div class="rounded-lg border border-border bg-card">
          <div class="flex items-center justify-between border-b border-border px-3 py-2">
            <h4 class="text-sm font-medium">Prompt 预览</h4>
            <div class="flex gap-1">
              <button
                @click="copyPrompt"
                class="flex h-7 items-center gap-1 rounded-md px-2 text-xs hover:bg-accent"
                :class="isCopied ? 'text-green-600' : 'text-muted-foreground'"
              >
                <component :is="isCopied ? Check : Copy" class="h-3.5 w-3.5" />
                {{ isCopied ? '已复制' : '复制' }}
              </button>
            </div>
          </div>
          <div class="p-3">
            <textarea
              v-model="promptText"
              class="min-h-[200px] w-full resize-none rounded-md border border-input bg-muted/50 p-2 font-mono text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Prompt 内容..."
            />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2">
          <button
            @click="assemblePrompt"
            :disabled="isGenerating"
            class="flex-1