<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 用户状态
const userInfo = ref({
  id: '123',
  name: '神秘用户',
  level: 1,
  isLoggedIn: true
})

// 应用状态
const isDarkMode = ref(false)
const showSettings = ref(false)

// 星星数组（用于深色模式）
const stars = ref([])
const clouds = ref([])
let starInterval = null
let cloudInterval = null

// 9大功能导航
const fortuneFeatures = [
  { name: '传统算命', icon: '🔮', path: '/fortune', desc: '生辰八字命理', color: '#667eea' },
  { name: '八字算命', icon: '🎯', path: '/bazi', desc: '天干地支分析', color: '#8B4513' },
  { name: '紫微斗数', icon: '⭐', path: '/ziwei', desc: '十四主星命盘', color: '#4B0082' },
  { name: '生肖运势', icon: '🐲', path: '/shengxiao', desc: '十二生肖运程', color: '#FF6B6B' },
  { name: '星座运势', icon: '♈', path: '/xingzuo', desc: '十二星座占卜', color: '#667eea' },
  { name: '姓名学', icon: '📝', path: '/xingming', desc: '五格数理分析', color: '#11998e' },
  { name: '周公解梦', icon: '💭', path: '/jiemeng', desc: '梦境寓意解读', color: '#4facfe' },
  { name: '塔罗牌', icon: '🃏', path: '/tarot', desc: '神秘塔罗占卜', color: '#2D1B4E' },
  { name: '多人合盘', icon: '💑', path: '/hepan', desc: '命理匹配分析', color: '#FF8C42' }
]

// 初始化时检查本地存储的主题设置
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

// 初始化背景效果
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

// 生成星星
function generateStars() {
  stars.value = []
  for (let i = 0; i < 80; i++) {
    addStar()
  }
}

// 添加单个星星
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

// 生成云朵
function generateClouds() {
  clouds.value = []
  for (let i = 0; i < 6; i++) {
    addCloud()
  }
}

// 添加单个云朵
function addCloud() {
  clouds.value.push({
    id: Date.now() + Math.random(),
    left: Math.random() * 80 + 10,
    top: Math.random() * 40 + 5,
    scale: Math.random() * 0.5 + 0.8,
    duration: Math.random() * 20 + 30
  })
}

// 应用主题
function applyTheme() {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
    generateStars()
  } else {
    document.documentElement.classList.remove('dark')
    generateClouds()
  }
}

// 切换深色模式
function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('darkMode', isDarkMode.value.toString())
  applyTheme()
}

// 打开设置
function openSettings() {
  showSettings.value = true
}

// 关闭设置
function closeSettings() {
  showSettings.value = false
}

// 退出登录
function logout() {
  userInfo.value.isLoggedIn = false
  alert('已退出登录')
}

// 导航到功能页面
function navigateTo(path) {
  router.push(path)
}
</script>

<template>
  <div class="home-page" :class="{ 'dark-mode': isDarkMode }">
    <!-- 深色模式星空背景 -->
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

    <!-- 浅色模式蓝天白云背景 -->
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

    <!-- 页面头部 -->
    <header class="page-header">
      <div class="header-left">
        <h1 class="galaxy-title">
          <span class="title-icon">☸️</span>
          <span class="title-text">命运之轮</span>
        </h1>
      </div>
      
      <div class="header-right">
        <!-- 主题切换 -->
        <button class="header-btn" @click="toggleDarkMode" :class="{ active: isDarkMode }">
          <span class="btn-icon">{{ isDarkMode ? '☀️' : '🌙' }}</span>
          <span class="btn-text">{{ isDarkMode ? '浅色' : '深色' }}</span>
        </button>
        
        <!-- 设置 -->
        <button class="header-btn" @click="openSettings">
          <span class="btn-icon">⚙️</span>
          <span class="btn-text">设置</span>
        </button>
        
        <!-- 退出 -->
        <button class="header-btn logout-btn" @click="logout">
          <span class="btn-icon">👋</span>
          <span class="btn-text">退出</span>
        </button>
        
        <!-- 用户信息 -->
        <div class="user-badge">
          <span class="user-id">{{ userInfo.id }}</span>
        </div>
      </div>
    </header>

    <!-- 标语 -->
    <div class="slogan-section">
      <p class="slogan-text">✨ 探索你的专属命运指引 ✨</p>
    </div>

    <!-- 9宫格功能导航 -->
    <nav class="feature-grid">
      <button
        v-for="feature in fortuneFeatures"
        :key="feature.path"
        class="feature-card"
        @click="navigateTo(feature.path)"
        :style="{ '--feature-color': feature.color }"
      >
        <span class="feature-icon">{{ feature.icon }}</span>
        <span class="feature-name">{{ feature.name }}</span>
        <span class="feature-desc">{{ feature.desc }}</span>
      </button>
    </nav>

    <!-- 设置弹窗 -->
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
/* 主页容器 */
.home-page {
  min-height: 100vh;
  padding: 20px;
  position: relative;
  overflow-x: hidden;
  transition: all 0.5s ease;
}

/* 深色模式背景 */
.dark-mode {
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
}

/* 星空背景 */
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
  animation-delay: -7s;
}

.nebula-3 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(240, 147, 251, 0.4) 0%, transparent 70%);
  bottom: 10%;
  left: 30%;
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -20px) scale(1.1); }
  50% { transform: translate(-20px, 30px) scale(1.05); }
  75% { transform: translate(-30px, -10px) scale(1.15); }
}

.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: twinkle ease-in-out infinite;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.meteor {
  position: absolute;
  width: 2px;
  height: 80px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
  animation: meteor linear infinite;
  opacity: 0;
}

.meteor-1 {
  top: 10%;
  right: 20%;
  animation-duration: 4s;
  animation-delay: 0s;
}

.meteor-2 {
  top: 30%;
  right: 40%;
  animation-duration: 5s;
  animation-delay: 2s;
}

.meteor-3 {
  top: 5%;
  right: 60%;
  animation-duration: 6s;
  animation-delay: 4s;
}

@keyframes meteor {
  0% {
    transform: translateX(0) translateY(-100px) rotate(45deg);
    opacity: 1;
  }
  70% { opacity: 1; }
  100% {
    transform: translateX(-500px) translateY(500px) rotate(45deg);
    opacity: 0;
  }
}

/* 浅色模式蓝天白云背景 */
.sky-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  background: linear-gradient(180deg, #87CEEB 0%, #E0F6FF 50%, #B8E6F0 100%);
}

.sun {
  position: absolute;
  top: 5%;
  right: 10%;
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, #FFD700 0%, #FFA500 70%);
  border-radius: 50%;
  box-shadow: 0 0 40px rgba(255, 215, 0, 0.6), 0 0 80px rgba(255, 165, 0, 0.4);
  animation: sunPulse 4s ease-in-out infinite;
}

@keyframes sunPulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(255, 215, 0, 0.6), 0 0 80px rgba(255, 165, 0, 0.4); }
  50% { transform: scale(1.05); box-shadow: 0 0 50px rgba(255, 215, 0, 0.8), 0 0 100px rgba(255, 165, 0, 0.5); }
}

.cloud {
  position: absolute;
  animation: cloudFloat linear infinite;
}

.cloud-part {
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
}

.cloud-part-1 {
  width: 60px;
  height: 60px;
  top: 0;
  left: 0;
}

.cloud-part-2 {
  width: 80px;
  height: 80px;
  top: -20px;
  left: 30px;
}

.cloud-part-3 {
  width: 60px;
  height: 60px;
  top: 0;
  left: 70px;
}

@keyframes cloudFloat {
  0% { transform: translateX(0) scale(var(--scale, 1)); }
  50% { transform: translateX(30px) scale(var(--scale, 1)); }
  100% { transform: translateX(0) scale(var(--scale, 1)); }
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
  position: relative;
  z-index: 1;
}

.header-left {
  display: flex;
  align-items: center;
}

.galaxy-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-size: 1.8rem;
  margin: 0;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  }
  to {
    text-shadow: 0 0 30px rgba(255, 255, 255, 0.8), 0 0 40px rgba(102, 126, 234, 0.5);
  }
}

.title-icon {
  font-size: 2rem;
}

.title-text {
  font-weight: 700;
  letter-spacing: 2px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.header-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.35);
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
}

.header-btn.active {
  background: rgba(255, 255, 255, 0.45);
  border-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
}

.btn-icon {
  font-size: 1.1rem;
}

.btn-text {
  font-weight: 500;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.4);
  border-color: rgba(239, 68, 68, 0.6);
}

.user-badge {
  padding: 8px 14px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 20px;
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
}

.user-id {
  font-size: 0.9rem;
}

/* 标语区域 */
.slogan-section {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.slogan-text {
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.3rem;
  font-weight: 500;
  letter-spacing: 3px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  animation: fadeInUp 1s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 9宫格功能导航 */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.feature-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--feature-color);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.feature-card:hover::before {
  transform: scaleX(1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 12px;
  transition: transform 0.3s ease;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1);
}

.feature-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 6px;
}

.feature-desc {
  font-size: 0.85rem;
  color: #6b7280;
  text-align: center;
}

/* 设置弹窗 */
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(5px);
}

.settings-modal {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.settings-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.settings-content {
  padding: 20px;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-item span {
  font-size: 1rem;
  color: #333;
}

.toggle-btn {
  padding: 6px 16px;
  background: #e5e7eb;
  border: none;
  border-radius: 15px;
  color: #6b7280;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* 弹窗动画 */
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

/* 响应式 */
@media (max-width: 768px) {
  .home-page {
    padding: 15px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-right {
    justify-content: center;
  }

  .galaxy-title {
    font-size: 1.4rem;
    justify-content: center;
  }

  .title-icon {
    font-size: 1.6rem;
  }

  .header-btn {
    padding: 6px 10px;
    font-size: 0.8rem;
  }

  .btn-text {
    display: none;
  }

  .slogan-text {
    font-size: 1rem;
    letter-spacing: 1px;
  }

  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .feature-card {
    padding: 20px 15px;
  }

  .feature-icon {
    font-size: 2.5rem;
  }

  .feature-name {
    font-size: 1rem;
  }

  .feature-desc {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .header-right {
    gap: 6px;
  }

  .header-btn {
    padding: 6px 8px;
  }

  .btn-icon {
    font-size: 1rem;
  }

  .user-badge {
    padding: 6px 10px;
  }

  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}
</style>
