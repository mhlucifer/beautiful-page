<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  wordCount?: number
  charCount?: number
  saveStatus?: 'saved' | 'saving' | 'unsaved'
}>()

const currentTime = computed(() => {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
})

const saveStatusText = computed(() => {
  switch (props.saveStatus) {
    case 'saved': return '已保存'
    case 'saving': return '保存中...'
    case 'unsaved': return '未保存'
    default: return ''
  }
})
</script>

<template>
  <div class="flex h-6 items-center justify-between border-t border-border bg-muted/50 px-3 text-xs">
    <div class="flex items-center gap-4">
      <span v-if="saveStatus" class="text-muted-foreground">{{ saveStatusText }}</span>
      <span v-if="wordCount !== undefined" class="text-muted-foreground">
        {{ wordCount }} 字
      </span>
      <span v-if="charCount !== undefined" class="text-muted-foreground">
        {{ charCount }} 字符
      </span>
    </div>
    <div class="flex items-center gap-4">
      <span class="text-muted-foreground">UTF-8</span>
      <span class="text-muted-foreground">{{ currentTime }}</span>
    </div>
  </div>
</template>
