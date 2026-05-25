<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

// 输入框引用
const usernameInput = ref(null)
const passwordInput = ref(null)

// 阶段控制：splash(开屏) -> morphing(转场) -> form(表单展示)
const stage = ref('splash')

// 表单展示后聚焦账号输入框
async function focusUsernameInput() {
  await nextTick()
  // 等待账号框淡入动画结束（delay 0.1s + 动画 0.5s ≈ 600ms）
  setTimeout(() => {
    if (usernameInput.value) {
      usernameInput.value.focus()
    }
  }, 600)
}

onMounted(() => {
  // 阶段一：1.8 秒开屏动画
  setTimeout(() => {
    stage.value = 'morphing'
  }, 1800)

  // 阶段二：转场动画 0.7 秒后展示表单
  setTimeout(() => {
    stage.value = 'form'
    focusUsernameInput()
  }, 2500)
})

function handleLogin() {
  errorMsg.value = ''

  if (!username.value || !password.value) {
    errorMsg.value = '请输入账号和密码'
    // 校验失败时自动聚焦到第一个空的输入框
    nextTick(() => {
      if (!username.value && usernameInput.value) {
        usernameInput.value.focus()
      } else if (!password.value && passwordInput.value) {
        passwordInput.value.focus()
      }
    })
    return
  }

  loading.value = true

  setTimeout(() => {
    if (username.value === 'testuser' && password.value === 'test123') {
      const userInfo = {
        id: '123',
        name: username.value,
        level: 1,
        isLoggedIn: true,
        loginTime: Date.now()
      }
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
      localStorage.setItem('isLoggedIn', 'true')
      loading.value = false
      router.push('/')
    } else {
      errorMsg.value = '账号或密码错误（测试账号：testuser / test123）'
      loading.value = false
      // 登录失败后清空密码并聚焦回密码框
      password.value = ''
      nextTick(() => {
        if (passwordInput.value) {
          passwordInput.value.focus()
        }
      })
    }
  }, 500)
}

function fillTestAccount() {
  username.value = 'testuser'
  password.value = 'test123'
  // 自动填充后聚焦到密码框，便于回车提交
  nextTick(() => {
    if (passwordInput.value) {
      passwordInput.value.focus()
    }
  })
}

function skipSplash() {
  stage.value = 'morphing'
  setTimeout(() => {
    stage.value = 'form'
    focusUsernameInput()
  }, 700)
}
</script>

<template>
  <div class="login-page" :class="`stage-${stage}`" @click="stage === 'splash' && skipSplash()">
    <!-- 开屏背景渐变层（form阶段会淡出） -->
    <div class="splash-backdrop"></div>

    <!-- 主内容容器：开屏元素与登录卡片共用 -->
    <div class="login-card">
      <!-- 顶部 Logo & 标题（贯穿三阶段，会平滑变形） -->
      <div class="brand-header">
        <div class="wheel-container">
          <div class="mystic-wheel">☸️</div>
          <!-- 光晕环 -->
          <div class="wheel-aura"></div>
        </div>
        <h1 class="brand-title">命运之轮</h1>
        <p class="brand-subtitle">探索你的专属命运指引</p>

        <!-- splash 阶段：加载点 -->
        <div v-if="stage === 'splash'" class="loading-dots">
          <span></span><span></span><span></span>
        </div>
      </div>

      <!-- 登录表单（form阶段才展示） -->
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-item" style="--delay: 0.1s">
          <label>账号</label>
          <input
            ref="usernameInput"
            v-model="username"
            type="text"
            placeholder="请输入账号"
            autocomplete="username"
          />
        </div>

        <div class="form-item" style="--delay: 0.2s">
          <label>密码</label>
          <input
            ref="passwordInput"
            v-model="password"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </div>

        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

        <button type="submit" class="login-btn" :disabled="loading" style="--delay: 0.3s">
          {{ loading ? '登录中...' : '登 录' }}
        </button>

        <div class="test-tip" style="--delay: 0.4s" @click="fillTestAccount">
          🔑 点击使用测试账号 (testuser / test123)
        </div>
      </form>
    </div>

    <!-- splash 阶段右下角提示 -->
    <div v-if="stage === 'splash'" class="skip-tip">点击任意处跳过</div>
  </div>
</template>

<style scoped>
.login-page {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  overflow: hidden;
}

/* ========== 开屏背景层 ========== */
.splash-backdrop {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  transition: opacity 0.8s ease;
  z-index: -1;
}

.stage-form .splash-backdrop {
  opacity: 0;
}

/* ========== 主卡片容器 ========== */
.login-card {
  position: relative;
  width: 90%;
  max-width: 400px;
  padding: 40px 30px;
  border-radius: 20px;
  color: #fff;
  transition:
    background 0.8s ease,
    border-color 0.8s ease,
    box-shadow 0.8s ease,
    backdrop-filter 0.8s ease,
    padding 0.8s ease;
  background: transparent;
  border: 1px solid transparent;
}

/* form 阶段：呈现卡片样式 */
.stage-form .login-card,
.stage-morphing .login-card {
  background: rgba(20, 20, 40, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(165, 180, 252, 0.3);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 60px rgba(102, 126, 234, 0.2);
}

.stage-morphing .login-card {
  animation: cardEmerge 0.7s ease-out forwards;
}

@keyframes cardEmerge {
  0% {
    transform: scale(0.92);
    opacity: 0.6;
  }
  60% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* ========== 品牌头部（共享元素） ========== */
.brand-header {
  text-align: center;
  transition: margin 0.8s ease;
}

.stage-splash .brand-header {
  /* splash 时居中显示，没有下方表单 */
  margin-bottom: 0;
}

.stage-form .brand-header,
.stage-morphing .brand-header {
  margin-bottom: 30px;
}

/* ========== 命运之轮 ========== */
.wheel-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.stage-splash .wheel-container {
  height: 130px;
  width: 130px;
  margin-bottom: 36px;
}

.stage-form .wheel-container,
.stage-morphing .wheel-container {
  height: 80px;
  width: 80px;
  margin-bottom: 12px;
}

.mystic-wheel {
  display: inline-block;
  animation: spin 4s linear infinite;
  filter: drop-shadow(0 0 20px rgba(165, 180, 252, 0.8));
  line-height: 1;
  transform-origin: center center;
  transition: font-size 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.stage-splash .mystic-wheel {
  font-size: 5rem;
}

.stage-form .mystic-wheel,
.stage-morphing .mystic-wheel {
  font-size: 3.5rem;
}

/* 光晕环 */
.wheel-aura {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(165, 180, 252, 0.4) 0%, rgba(165, 180, 252, 0) 70%);
  animation: pulse 2.5s ease-in-out infinite;
  pointer-events: none;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.2;
  }
}

/* ========== 标题 ========== */
.brand-title {
  letter-spacing: 4px;
  line-height: 1.4;
  background: linear-gradient(to right, #fff, #a5b4fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition:
    font-size 0.8s ease,
    margin 0.8s ease;
}

.stage-splash .brand-title {
  font-size: 2.6rem;
  margin: 0 0 18px;
}

.stage-form .brand-title,
.stage-morphing .brand-title {
  font-size: 1.8rem;
  margin: 8px 0 4px;
}

.brand-subtitle {
  opacity: 0.8;
  letter-spacing: 2px;
  line-height: 1.6;
  transition:
    font-size 0.8s ease,
    margin 0.8s ease;
}

.stage-splash .brand-subtitle {
  font-size: 1.05rem;
  margin-bottom: 36px;
}

.stage-form .brand-subtitle,
.stage-morphing .brand-subtitle {
  font-size: 0.85rem;
  margin-bottom: 0;
}

/* ========== 加载点 ========== */
.loading-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  animation: fadeOut 0.4s ease forwards;
  animation-play-state: paused;
}

.stage-splash .loading-dots {
  animation-play-state: running;
  animation: fadeIn 0.4s ease forwards;
}

.loading-dots span {
  width: 10px;
  height: 10px;
  background-color: #a5b4fc;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}
.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

/* ========== 登录表单 ========== */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transition:
    max-height 0.6s ease,
    opacity 0.4s ease;
}

.stage-form .login-form {
  max-height: 500px;
  opacity: 1;
}

.form-item,
.login-btn,
.test-tip {
  opacity: 0;
  transform: translateY(15px);
}

.stage-form .form-item,
.stage-form .login-btn,
.stage-form .test-tip {
  animation: itemFadeIn 0.5s ease forwards;
  animation-delay: var(--delay, 0s);
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item label {
  font-size: 0.85rem;
  opacity: 0.85;
  letter-spacing: 1px;
}

.form-item input {
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(165, 180, 252, 0.3);
  border-radius: 10px;
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

.form-item input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-item input:focus {
  border-color: #a5b4fc;
  box-shadow: 0 0 0 3px rgba(165, 180, 252, 0.2);
  background: rgba(255, 255, 255, 0.12);
}

.error-msg {
  padding: 8px 12px;
  background: rgba(244, 67, 54, 0.15);
  border: 1px solid rgba(244, 67, 54, 0.4);
  border-radius: 8px;
  color: #ff8a80;
  font-size: 0.85rem;
  text-align: center;
}

.login-btn {
  margin-top: 8px;
  padding: 12px;
  font-size: 1.05rem;
  letter-spacing: 6px;
  color: #fff;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    opacity 0.3s ease;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.6);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-tip {
  text-align: center;
  font-size: 0.8rem;
  opacity: 0.7;
  cursor: pointer;
  letter-spacing: 1px;
  padding: 6px;
  border-radius: 6px;
  transition: background 0.3s ease;
}

.test-tip:hover {
  background: rgba(165, 180, 252, 0.1);
}

/* ========== 跳过提示 ========== */
.skip-tip {
  position: absolute;
  bottom: 30px;
  right: 30px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 2px;
  animation: blink 2s ease-in-out infinite;
}

/* ========== 动画关键帧 ========== */
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@keyframes itemFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes blink {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}
</style>
