<script setup lang="ts">
import { computed } from 'vue'

const hasContent = computed(() => false)
</script>

<template>
  <div class="flex h-full flex-col bg-background">
    <!-- Tab Bar -->
    <div class="flex h-9 items-center border-b border-border bg-muted/30">
      <div class="flex h-full items-center">
        <div 
          v-if="!hasContent"
          class="flex h-full items-center gap-2 px-3 text-sm text-muted-foreground"
        >
          <span>无打开的文件</span>
        </div>
      </div>
    </div>

    <!-- Editor Content -->
    <div class="flex-1 overflow-hidden">
      <div class="flex h-full flex-col items-center justify-center p-8">
        <div class="text-center">
          <h1 class="text-2xl font-bold mb-4">南柯 Universe</h1>
          <p class="text-muted-foreground">你的 AI 辅助创作工作台</p>
          <p class="text-sm text-muted-foreground mt-2">从左侧选择一个面板开始创作</p>
        </div>
      </div>
    </div>

    <!-- Breadcrumbs / Path Bar -->
    <div class="flex h-6 items-center gap-2 border-t border-border bg-muted/30 px-3 text-xs text-muted-foreground">
      <span>南柯 Universe</span>
      <span>/</span>
      <span>未命名项目</span>
    </div>
  </div>
</template>
