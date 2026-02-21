import './assets/styles/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Initialize database
import { initDatabase } from './db/database'

async function bootstrap() {
  // Initialize IndexedDB first
  await initDatabase()
  
  const app = createApp(App)
  
  app.use(createPinia())
  app.use(router)
  
  app.mount('#app')
}

bootstrap().catch((error) => {
  console.error('Failed to bootstrap app:', error)
  // Show error UI
  document.body.innerHTML = `
    <div style="padding: 40px; text-align: center; font-family: sans-serif;">
      <h1 style="color: #e74c3c;">启动失败</h1>
      <p>应用初始化时出错，请刷新页面重试。</p>
      <pre style="background: #f5f5f5; padding: 15px; text-align: left; margin-top: 20px; overflow: auto;">${error.message}</pre>
    </div>
  `
})
