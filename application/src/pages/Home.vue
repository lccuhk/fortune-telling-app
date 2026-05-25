<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHistory } from '../composables/useHistory.js'

const router = useRouter()
const { openHistory, historyCount } = useHistory()

const userInfo = ref({
  id: '123',
  name: '神秘用户',
  level: 1,
  isLoggedIn: true
})

const isDarkMode = ref(false)
const showSettings = ref(false)

const stars = ref([])
const clouds = ref([])
let starInterval = null
let cloudInterval = null

const fortuneFeatures = [
  { name: '传统算命', icon: '🔮', path: '/fortune', desc: '生辰八字命理', color: '#667eea' },
  { name: '八字算命', icon: '🎯', path: '/bazi', desc: '天干地支分析', color: '#8B4513' },
  { name: '紫微斗数', icon: '⭐', path: '/ziwei', desc: '十四主星命盘', color: '#4B0082' },
  { name: '生肖运势', icon: '🐲', path: '/shengxiao', desc: '十二生肖运程', color: '#FF6B6B' },
  { name: '星座运势', icon: '♈', path: '/xingzuo', desc: '十二星座占卜', color: '#667eea' },
  { name: '姓名学', icon: '📝', path: '/xingming', desc: '五格数理分析', color: '#11998e' },
  { name: '周公解梦', icon: '💭', path: '/jiemeng', desc: '梦境寓意解读', color: '#4facfe' },
  { name: '塔罗牌', icon: '🃏', path: '/tarot', desc: '神秘塔罗占卜', color: '#2D1B4E' },
  { name: '多人合盘', icon: '💑', path: '/hepan', desc: '命理匹配分析', color: '#FF8C42' },
  { name: '黄历', icon: '📅', path: '/huangli', desc: '每日宜忌查询', color: '#f093fb' }
]

onMounted(() => {
  const savedTheme = localStorage.getItem('darkMode')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'true'
    applyTheme()
  }
  initBackgroundEffects()
})

onUnmounted(() => {
  if (starInterval) clearInterval(starInterval)
  if (cloudInterval) clearInterval(cloudInterval)
})

function initBackgroundEffects() {
  generateStars()
  generateClouds()

  starInterval = setInterval(() => {
    if (isDarkMode.value && stars.value.length < 100) {
      addStar()
    }
  }, 2000)

  cloudInterval = setInterval(() => {
    if (!isDarkMode.value && clouds.value.length < 8) {
      addCloud()
    }
  }, 5000)
}

function generateStars() {
  stars.value = []
  for (let i = 0; i < 80; i++) {
    addStar()
  }
}

function addStar() {
  stars.value.push({
    id: Date.now() + Math.random(),
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 3,
    duration: Math.random() * 3 + 2
  })
}

function generateClouds() {
  clouds.value = []
  for (let i = 0; i < 6; i++) {
    addCloud()
  }
}

function addCloud() {
  clouds.value.push({
    id: Date.now() + Math.random(),
    left: Math.random() * 80 + 10,
    top: Math.random() * 40 + 5,
    scale: Math.random() * 0.5 + 0.8,
    duration: Math.random() * 20 + 30
  })
}

function applyTheme() {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
    generateStars()
  } else {
    document.documentElement.classList.remove('dark')
    generateClouds()
  }
}

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('darkMode', isDarkMode.value.toString())
  applyTheme()
}

function openSettings() {
  showSettings.value = true
}

function closeSettings() {
  showSettings.value = false
}

function logout() {
  userInfo.value.isLoggedIn = false
  alert('已退出登录')
}

function navigateTo(path) {
  router.push(path)
}
</script>

<template>
  <div class="home-page" :class="{ 'dark-mode': isDarkMode }">
    <div v-if="isDarkMode" class="starry-background">
      <div class="nebula nebula-1"></div>
      <div class="nebula nebula-2"></div>
      <div class="nebula nebula-3"></div>
      <div
        v-for="star in stars"
        :key="star.id"
        class="star"
        :style="{
          left: star.left + '%',
          top: star.top + '%',
          width: star.size + 'px',
          height: star.size + 'px',
          animationDelay: star.delay + 's',
          animationDuration: star.duration + 's'
        }"
      ></div>
      <div class="meteor meteor-1"></div>
      <div class="meteor meteor-2"></div>
      <div class="meteor meteor-3"></div>
    </div>

    <div v-else class="sky-background">
      <div class="sun"></div>
      <div
        v-for="cloud in clouds"
        :key="cloud.id"
        class="cloud"
        :style="{
          left: cloud.left + '%',
          top: cloud.top + '%',
          transform: `scale(${cloud.scale})`,
          animationDuration: cloud.duration + 's'
        }"
      >
        <div class="cloud-part cloud-part-1"></div>
        <div class="cloud-part cloud-part-2"></div>
        <div class="cloud-part cloud-part-3"></div>
      </div>
    </div>

    <header class="page-header">
      <div class="header-left">
        <h1 class="galaxy-title">
          <span class="title-icon">☸️</span>
          <span class="title-text">命运之轮</span>
        </h1>
      </div>

      <div class="header-right">
        <button class="header-btn history-btn" @click="openHistory">
          <span class="btn-icon">📜</span>
          <span class="btn-text">历史</span>
          <span v-if="historyCount > 0" class="history-badge">{{ historyCount }}</span>
        </button>

        <button class="header-btn" :class="{ active: isDarkMode }" @click="toggleDarkMode">
          <span class="btn-icon">{{ isDarkMode ? '☀️' : '🌙' }}</span>
          <span class="btn-text">{{ isDarkMode ? '浅色' : '深色' }}</span>
        </button>

        <button class="header-btn" @click="openSettings">
          <span class="btn-icon">⚙️</span>
          <span class="btn-text">设置</span>
        </button>

        <button class="header-btn logout-btn" @click="logout">
          <span class="btn-icon">👋</span>
          <span class="btn-text">退出</span>
        </button>

        <div class="user-badge">
          <span class="user-id">{{ userInfo.id }}</span>
        </div>
      </div>
    </header>

    <div class="slogan-section">
      <p class="slogan-text">✨ 探索你的专属命运指引 ✨</p>
    </div>

    <nav class="feature-grid">
      <button
        v-for="feature in fortuneFeatures"
        :key="feature.path"
        class="feature-card"
        :style="{ '--feature-color': feature.color }"
        @click="navigateTo(feature.path)"
      >
        <span class="feature-icon">{{ feature.icon }}</span>
        <span class="feature-name">{{ feature.name }}</span>
        <span class="feature-desc">{{ feature.desc }}</span>
      </button>
    </nav>

    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-logo">
          <span class="logo-icon">☸️</span>
          <span class="logo-text">命运之轮</span>
        </div>
        <p class="disclaimer">
          ⚠️
          声明：本应用所提供的所有占卜、算命及运势解析内容仅供娱乐参考，切勿过度迷信。请以科学、积极的态度面对生活，您的命运掌握在自己手中。
        </p>
        <div class="social-links">
          <a href="https://github.com" target="_blank" title="GitHub" class="social-icon">🐙</a>
          <a href="#" title="WeChat" class="social-icon">💬</a>
          <a href="#" title="Weibo" class="social-icon">🌐</a>
        </div>
        <p class="copyright">&copy; {{ new Date().getFullYear() }} 命运之轮 All Rights Reserved.</p>
      </div>
    </footer>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showSettings" class="settings-overlay" @click.self="closeSettings">
          <div class="settings-modal">
            <div class="settings-header">
              <h3>⚙️ 设置</h3>
              <button class="close-btn" @click="closeSettings">✕</button>
            </div>
            <div class="settings-content">
              <div class="settings-item">
                <span>深色模式</span>
                <button class="toggle-btn" :class="{ active: isDarkMode }" @click="toggleDarkMode">
                  {{ isDarkMode ? '开启' : '关闭' }}
                </button>
              </div>
              <div class="settings-item">
                <span>通知提醒</span>
                <button class="toggle-btn active">开启</button>
              </div>
              <div class="settings-item">
                <span>音效</span>
                <button class="toggle-btn">关闭</button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: 20px;
  position: relative;
  overflow-x: hidden;
  transition: all 0.5s ease;
}

.dark-mode {
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
}

.starry-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.nebula {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: float 20s ease-in-out infinite;
}

.nebula-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.6) 0%, transparent 70%);
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.nebula-2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(118, 75, 162, 0.5) 0%, transparent 70%);
  top: 50%;
  right: 10%;
  animation-delay: 5s;
}

.nebula-3 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.4) 0%, transparent 70%);
  bottom: 10%;
  left: 50%;
  animation-delay: 10s;
}

.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: twinkle 3s ease-in-out infinite;
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(20px, -20px);
  }
}

.meteor {
  position: absolute;
  width: 2px;
  height: 80px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.8), transparent);
  animation: meteor 3s linear infinite;
  opacity: 0;
}

.meteor-1 {
  top: 10%;
  left: 20%;
  transform: rotate(45deg);
  animation-delay: 0s;
}

.meteor-2 {
  top: 30%;
  right: 30%;
  transform: rotate(45deg);
  animation-delay: 2s;
}

.meteor-3 {
  top: 50%;
  left: 60%;
  transform: rotate(45deg);
  animation-delay: 4s;
}

@keyframes meteor {
  0% {
    opacity: 0;
    transform: rotate(45deg) translateY(-100px);
  }
  10% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: rotate(45deg) translateY(500px);
  }
}

.sky-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #87ceeb 0%, #e0f6ff 100%);
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.sun {
  position: absolute;
  top: 10%;
  right: 10%;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, #ffd700 0%, #ffa500 100%);
  border-radius: 50%;
  box-shadow: 0 0 60px rgba(255, 215, 0, 0.6);
  animation: sunPulse 4s ease-in-out infinite;
}

@keyframes sunPulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 60px rgba(255, 215, 0, 0.6);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 80px rgba(255, 215, 0, 0.8);
  }
}

.cloud {
  position: absolute;
  animation: cloudFloat 30s linear infinite;
}

@keyframes cloudFloat {
  0% {
    transform: translateX(-100px);
  }
  100% {
    transform: translateX(calc(100vw + 100px));
  }
}

.cloud-part {
  position: absolute;
  background: white;
  border-radius: 50%;
  opacity: 0.9;
}

.cloud-part-1 {
  width: 60px;
  height: 60px;
  left: 0;
  top: 20px;
}

.cloud-part-2 {
  width: 80px;
  height: 80px;
  left: 40px;
  top: 0;
}

.cloud-part-3 {
  width: 60px;
  height: 60px;
  left: 100px;
  top: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 10px 0;
}

.header-left {
  display: flex;
  align-items: center;
}

.galaxy-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 1.8rem;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.title-icon {
  font-size: 2rem;
  animation: rotate 10s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.title-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.header-btn.active {
  background: rgba(102, 126, 234, 0.5);
  border-color: rgba(102, 126, 234, 0.8);
}

.history-btn {
  position: relative;
}

.history-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #ef4444;
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon {
  font-size: 1rem;
}

.btn-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.logout-btn {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.user-badge {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.user-id {
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
}

.slogan-section {
  text-align: center;
  margin-bottom: 40px;
}

.slogan-text {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto 40px;
}

.feature-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 30px 20px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 2.5rem;
  transition: transform 0.3s ease;
}

.feature-card:hover .feature-icon {
  transform: scale(1.2);
}

.feature-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
}

.feature-desc {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
}

.app-footer {
  margin-top: 40px;
  padding: 30px 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.footer-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.footer-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
}

.disclaimer {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 20px;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 15px;
}

.social-icon {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.social-icon:hover {
  transform: scale(1.2);
}

.copyright {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-modal {
  width: 400px;
  max-width: 90%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.settings-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #374151;
}

.close-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e5e7eb;
}

.settings-content {
  padding: 20px;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f3f4f6;
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-item span {
  font-size: 1rem;
  color: #374151;
}

.toggle-btn {
  padding: 8px 20px;
  background: #e5e7eb;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s ease;
}

.toggle-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .settings-modal,
.modal-leave-to .settings-modal {
  transform: scale(0.9);
}

@media (max-width: 768px) {
  .home-page {
    padding: 15px;
  }

  .page-header {
    flex-direction: column;
    gap: 15px;
  }

  .header-right {
    flex-wrap: wrap;
    justify-content: center;
  }

  .galaxy-title {
    font-size: 1.5rem;
  }

  .slogan-text {
    font-size: 1rem;
  }

  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .feature-card {
    padding: 20px 15px;
  }

  .feature-icon {
    font-size: 2rem;
  }

  .feature-name {
    font-size: 1rem;
  }

  .feature-desc {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }

  .header-btn {
    padding: 6px 12px;
  }

  .btn-text {
    display: none;
  }
}
</style>
