<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
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

// 布局模式：A(1列), B(2列+第9个占整行), C(3列九宫格)
const layoutMode = ref('C')
const layoutOptions = [
  { key: 'A', label: '单列', desc: '1×9' },
  { key: 'B', label: '双列', desc: '2×4+1' },
  { key: 'C', label: '九宫', desc: '3×3' }
]

function setLayout(mode) {
  layoutMode.value = mode
  localStorage.setItem('layoutMode', mode)
}

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

// 初始化时检查本地存储的主题和布局设置
onMounted(() => {
  const savedTheme = localStorage.getItem('darkMode')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'true'
    applyTheme()
  }
  const savedLayout = localStorage.getItem('layoutMode')
  if (savedLayout && ['A', 'B', 'C'].includes(savedLayout)) {
    layoutMode.value = savedLayout
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
  if (!confirm('确定要退出登录吗？')) return
  userInfo.value.isLoggedIn = false
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('userInfo')
  router.push('/login')
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

    <!-- 布局切换 -->
    <div class="layout-switcher">
      <span class="layout-label">布局：</span>
      <div class="layout-buttons">
        <button
          v-for="opt in layoutOptions"
          :key="opt.key"
          class="layout-btn"
          :class="{ active: layoutMode === opt.key }"
          @click="setLayout(opt.key)"
          :title="opt.desc"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- 9宫格功能导航 -->
    <nav class="feature-grid" :class="`layout-${layoutMode}`">
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

    <!-- 页脚 (Footer) -->
    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-logo">
          <span class="logo-icon">☸️</span>
          <span class="logo-text">命运之轮</span>
        </div>
        <p class="disclaimer">⚠️ 声明：本应用所提供的所有占卜、算命及运势解析内容仅供娱乐参考，切勿过度迷信。请以科学、积极的态度面对生活，您的命运掌握在自己手中。</p>
        <div class="social-links">
          <a href="https://github.com" target="_blank" title="GitHub" class="social-icon">🐙</a>
          <a href="#" title="WeChat" class="social-icon">💬</a>
          <a href="#" title="Weibo" class="social-icon">🌐</a>
        </div>
        <p class="copyright">&copy; {{ new Date().getFullYear() }} 命运之轮 All Rights Reserved.</p>
      </div>
    </footer>

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

/* 浅色模式柔和紫粉渐变背景 */
.sky-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  background: linear-gradient(135deg, #fef3ff 0%, #f0e7ff 30%, #e8f4ff 60%, #f0f9ff 100%);
}

/* 浅色模式光晕装饰 */
.sky-background::before,
.sky-background::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.6;
  animation: float 25s ease-in-out infinite;
}

.sky-background::before {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(167, 139, 250, 0.4) 0%, transparent 70%);
  top: -100px;
  right: -100px;
}

.sky-background::after {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(244, 114, 182, 0.3) 0%, transparent 70%);
  bottom: -50px;
  left: -50px;
  animation-delay: -12s;
}

/* 浅色模式发光水晶球 */
.sun {
  position: absolute;
  top: 8%;
  right: 12%;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle at 30% 30%, #fff 0%, #e9d5ff 30%, #c4b5fd 60%, #a78bfa 100%);
  border-radius: 50%;
  box-shadow:
    0 0 60px rgba(167, 139, 250, 0.5),
    0 0 100px rgba(167, 139, 250, 0.3),
    inset 0 0 30px rgba(255, 255, 255, 0.8);
  animation: sunPulse 5s ease-in-out infinite;
}

@keyframes sunPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow:
      0 0 60px rgba(167, 139, 250, 0.5),
      0 0 100px rgba(167, 139, 250, 0.3),
      inset 0 0 30px rgba(255, 255, 255, 0.8);
  }
  50% {
    transform: scale(1.08);
    box-shadow:
      0 0 80px rgba(167, 139, 250, 0.7),
      0 0 140px rgba(167, 139, 250, 0.4),
      inset 0 0 40px rgba(255, 255, 255, 0.9);
  }
}

.cloud {
  position: absolute;
  animation: cloudFloat linear infinite;
  opacity: 0.7;
}

.cloud-part {
  position: absolute;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(233, 213, 255, 0.8));
  border-radius: 50%;
  box-shadow: 0 4px 20px rgba(167, 139, 250, 0.15);
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
  color: #581c87;
  font-size: 1.8rem;
  margin: 0;
  text-shadow: 0 0 20px rgba(167, 139, 250, 0.3);
  animation: glow 2s ease-in-out infinite alternate;
}

.dark-mode .galaxy-title {
  color: white;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
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
  background: rgba(167, 139, 250, 0.15);
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: 20px;
  color: #581c87;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.dark-mode .header-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
}

.header-btn:hover {
  background: rgba(167, 139, 250, 0.25);
  border-color: rgba(167, 139, 250, 0.5);
  transform: translateY(-2px);
}

.dark-mode .header-btn:hover {
  background: rgba(255, 255, 255, 0.35);
  border-color: rgba(255, 255, 255, 0.6);
}

.header-btn.active {
  background: rgba(167, 139, 250, 0.35);
  border-color: rgba(167, 139, 250, 0.6);
  box-shadow: 0 0 15px rgba(167, 139, 250, 0.3);
}

.dark-mode .header-btn.active {
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
  color: #581c87;
  font-size: 1.3rem;
  font-weight: 500;
  letter-spacing: 3px;
  text-shadow: 0 2px 10px rgba(167, 139, 250, 0.2);
  animation: fadeInUp 1s ease;
}

.dark-mode .slogan-text {
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
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

/* 布局切换器 */
.layout-switcher {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.layout-label {
  color: #7c3aed;
  font-size: 0.85rem;
  letter-spacing: 1px;
}

.dark-mode .layout-label {
  color: rgba(255, 255, 255, 0.8);
}

.layout-buttons {
  display: flex;
  gap: 6px;
  padding: 4px;
  background: rgba(167, 139, 250, 0.15);
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.dark-mode .layout-buttons {
  background: rgba(255, 255, 255, 0.1);
}

.layout-btn {
  padding: 6px 14px;
  font-size: 0.8rem;
  color: #7c3aed;
  background: transparent;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 1px;
}

.dark-mode .layout-btn {
  color: rgba(255, 255, 255, 0.7);
}

.layout-btn:hover {
  color: #581c87;
  background: rgba(167, 139, 250, 0.25);
}

.dark-mode .layout-btn:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
}

.layout-btn.active {
  color: white;
  background: linear-gradient(135deg, #667eea, #764ba2);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
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
  transition: grid-template-columns 0.3s ease;
}

/* 版本 A：1列布局 */
.feature-grid.layout-A {
  grid-template-columns: 1fr;
  max-width: 400px;
}

/* 版本 B：2列 + 第9个占整行 */
.feature-grid.layout-B {
  grid-template-columns: repeat(2, 1fr);
  max-width: 600px;
}

.feature-grid.layout-B .feature-card:nth-child(9) {
  grid-column: 1 / -1;
}

/* 版本 C：3列九宫格（默认） */
.feature-grid.layout-C {
  grid-template-columns: repeat(3, 1fr);
}

.feature-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  outline: none;
  box-shadow: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

.feature-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 20px;
  padding: 1px;
  background: rgba(203, 213, 225, 0.15);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.dark-mode .feature-card {
  background: rgba(30, 30, 45, 0.7);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.dark-mode .feature-card::after {
  background: linear-gradient(135deg, rgba(165, 180, 252, 0.4), rgba(196, 181, 253, 0.35), rgba(129, 140, 248, 0.35));
  padding: 1.5px;
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
  transition: transform 0.4s ease;
  transform-origin: left;
}

.feature-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.95);
}

.dark-mode .feature-card:hover {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px var(--feature-color);
  background: rgba(30, 30, 45, 0.7);
}

.feature-card:hover::before {
  transform: scaleX(1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 12px;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.feature-card:hover .feature-icon {
  transform: scale(1.2) rotate(5deg);
}

.feature-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #581c87;
  margin-bottom: 6px;
  transition: color 0.3s ease;
}

.dark-mode .feature-name {
  color: #f3f4f6;
}

.feature-card:hover .feature-name {
  color: var(--feature-color);
}

.feature-desc {
  font-size: 0.85rem;
  color: #7c3aed;
  text-align: center;
  opacity: 0.8;
}

.dark-mode .feature-desc {
  color: #9ca3af;
  opacity: 1;
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

/* 页脚样式 */
.app-footer {
  margin-top: 60px;
  padding: 40px 20px 20px;
  position: relative;
  z-index: 1;
}

.footer-content {
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
  color: #581c87;
}

.dark-mode .footer-content {
  color: rgba(255, 255, 255, 0.6);
}

.footer-logo {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.disclaimer {
  font-size: 0.85rem;
  line-height: 1.6;
  margin-bottom: 20px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  background: rgba(167, 139, 250, 0.1);
  padding: 10px 15px;
  border-radius: 8px;
}

.dark-mode .disclaimer {
  background: rgba(0, 0, 0, 0.2);
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.social-icon {
  font-size: 1.5rem;
  text-decoration: none;
  transition: transform 0.3s ease;
  display: inline-block;
}

.social-icon:hover {
  transform: scale(1.2) translateY(-3px);
}

.copyright {
  font-size: 0.8rem;
  opacity: 0.7;
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
    gap: 12px;
  }

  .feature-grid.layout-A {
    grid-template-columns: 1fr;
    max-width: 100%;
  }

  .feature-grid.layout-B {
    grid-template-columns: repeat(2, 1fr);
    max-width: 100%;
  }

  .feature-grid.layout-B .feature-card:nth-child(9) {
    grid-column: 1 / -1;
  }

  .feature-grid.layout-C {
    grid-template-columns: repeat(3, 1fr);
    max-width: 100%;
  }

  .feature-card {
    padding: 16px 10px;
  }

  .feature-icon {
    font-size: 2rem;
  }

  .feature-name {
    font-size: 0.9rem;
  }

  .feature-desc {
    font-size: 0.7rem;
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

  .layout-switcher {
    margin-bottom: 16px;
  }

  .layout-label {
    display: none;
  }

  .feature-grid {
    gap: 10px;
  }

  .feature-grid.layout-A {
    grid-template-columns: 1fr;
  }

  .feature-grid.layout-B {
    grid-template-columns: repeat(2, 1fr);
  }

  .feature-grid.layout-B .feature-card:nth-child(9) {
    grid-column: 1 / -1;
  }

  .feature-grid.layout-C {
    grid-template-columns: repeat(3, 1fr);
  }

  .feature-card {
    padding: 14px 8px;
  }

  .feature-icon {
    font-size: 1.8rem;
    margin-bottom: 8px;
  }

  .feature-name {
    font-size: 0.85rem;
    margin-bottom: 4px;
  }

  .feature-desc {
    font-size: 0.65rem;
    display: none;
  }
}
</style>
