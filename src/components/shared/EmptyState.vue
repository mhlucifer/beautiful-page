<script setup lang="ts">
import { computed } from 'vue'
import { 
  FileText, 
  FolderOpen, 
  Users, 
  Search,
  Inbox
} from 'lucide-vue-next'

interface Action {
  label: string
  variant?: 'default' | 'outline'
  onClick?: () => void
}

interface Props {
  icon?: string
  title: string
  description?: string
  actions?: Action[]
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'inbox',
  description: '',
  actions: () => []
})

const iconComponent = computed(() => {
  const icons: Record<string, any> = {
    'file-text': FileText,
    'folder-open': FolderOpen,
    'users': Users,
    'search': Search,
    'inbox': Inbox,
  }
  return icons[props.icon] || Inbox
})
</script>

<template>
  <div class="flex h-full w-full flex-col items-center justify-center p-8">
    <div class="flex max-w-md flex-col items-center text-center">
      <!-- Icon -->
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <component :is="iconComponent" class="h-8 w-8 text-muted-foreground" />
      </div>

      <!-- Title -->
      <h3 class="mb-2 text-lg font-semibold text-foreground">
        {{ title }}
      </h3>

      <!-- Description -->
      <p v-if="description" class="mb-6 text-sm text-muted-foreground">
        {{ description }}
      </p>

      <!-- Actions -->
      <div v-if="actions.length > 0" class="flex items-center gap-3">
        <button
          v-for="(action, index) in actions"
          :key="index"
          @click="action.onClick"
          :class="[
            'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
            action.variant === 'outline'
              ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          ]"
        >
          {{ action.label }}
        </button>
      </div>
    </div>
  </div>
</template>
