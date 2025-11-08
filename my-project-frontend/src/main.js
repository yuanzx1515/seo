import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from "axios";
import 'element-plus/dist/index.css'
// 移除暗色主题，使用浅色主题
// import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

axios.defaults.baseURL = 'http://localhost:8080'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router)

app.mount('#app')
