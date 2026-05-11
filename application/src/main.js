import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import errorHandler from './services/errorHandler.js'

const app = createApp(App)

errorHandler.init(app)

app.use(router)
app.mount('#app')
