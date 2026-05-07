<script setup>
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'

const showSplash = ref(true)

onMounted(() => {
  // 模拟开屏动画 2秒后消失
  setTimeout(() => {
    showSplash.value = false
  }, 2000)
})
</script>

<template>
  <!-- 开屏欢迎动画 (Splash Screen) -->
  <Transition name="fade">
    <div v-if="showSplash" class="splash-screen">
      <div class="splash-content">
        <div class="wheel-container">
          <div class="mystic-wheel">☸️</div>
        </div>
        <h1 class="splash-title">命运之轮</h1>
        <p class="splash-subtitle">探索你的专属命运指引</p>
        <div class="loading-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  </Transition>

  <RouterView />
</template>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 开屏动画样式 */
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  color: white;
}

.splash-content {
  text-align: center;
  animation: floatUp 1s ease-out forwards;
}

.wheel-container {
  margin-bottom: 20px;
}

.mystic-wheel {
  font-size: 5rem;
  display: inline-block;
  animation: spin 4s linear infinite;
  filter: drop-shadow(0 0 20px rgba(102, 126, 234, 0.8));
}

.splash-title {
  font-size: 2.5rem;
  letter-spacing: 4px;
  margin-bottom: 10px;
  background: linear-gradient(to right, #fff, #a5b4fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.splash-subtitle {
  font-size: 1.1rem;
  opacity: 0.8;
  letter-spacing: 2px;
  margin-bottom: 30px;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.loading-dots span {
  width: 10px;
  height: 10px;
  background-color: #a5b4fc;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes floatUp {
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.8s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
