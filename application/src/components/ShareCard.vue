<script setup>
import { ref, computed } from 'vue'
import html2canvas from 'html2canvas'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  result: {
    type: Object,
    default: null
  },
  userName: {
    type: String,
    default: ''
  },
  fortuneType: {
    type: String,
    default: '传统算命'
  }
})

const emit = defineEmits(['close', 'shared'])

// 分享卡片引用
const shareCardRef = ref(null)
const isGenerating = ref(false)
const generatedImage = ref(null)

// 计算属性：获取运势类型图标
const fortuneTypeIcon = computed(() => {
  const icons = {
    传统算命: '🔮',
    八字算命: '🎯',
    紫微斗数: '⭐',
    生肖运势: '🐲',
    星座运势: '♈',
    姓名学: '📝',
    周公解梦: '💭',
    塔罗牌占卜: '🃏'
  }
  return icons[props.fortuneType] || '🔮'
})

// 计算属性：获取运势评分
const fortuneScore = computed(() => {
  if (!props.result) return 85
  // 根据结果内容生成一个分数
  const content = (props.result.prediction || '') + (props.result.advice || '')
  let score = 75
  const positiveWords = ['吉', '顺', '好', '旺', '福', '财', '喜', '安', '康', '顺遂']
  positiveWords.forEach(word => {
    if (content.includes(word)) score += 2
  })
  return Math.min(98, Math.max(60, score))
})

// 计算属性：获取幸运色
const luckyColor = computed(() => {
  const colors = [
    { name: '中国红', hex: '#DC143C', desc: '热情活力' },
    { name: '宝石蓝', hex: '#4169E1', desc: '智慧沉稳' },
    { name: '翡翠绿', hex: '#50C878', desc: '生机勃勃' },
    { name: '紫罗兰', hex: '#8B00FF', desc: '神秘高贵' },
    { name: '金色', hex: '#FFD700', desc: '财富成功' },
    { name: '珊瑚橙', hex: '#FF7F50', desc: '温暖活力' }
  ]
  // 根据用户名和日期选择颜色
  const seed = (props.userName || '').length + new Date().getDate()
  return colors[seed % colors.length]
})

// 计算属性：获取幸运数字
const luckyNumbers = computed(() => {
  const seed = (props.userName || '').charCodeAt(0) || 1
  const nums = []
  for (let i = 0; i < 3; i++) {
    nums.push(((seed + i * 7) % 9) + 1)
  }
  return nums
})

// 计算属性：获取宜忌
const yiJi = computed(() => {
  const yiList = ['签约', '出行', '求财', '交友', '学习', '创新', '投资', '求职']
  const jiList = ['争吵', '冒险', '借贷', '冲动', '熬夜', '拖延', '浪费', '固执']

  const seed = new Date().getDate()
  return {
    yi: yiList.slice(seed % 4, (seed % 4) + 2),
    ji: jiList.slice((seed + 2) % 4, ((seed + 2) % 4) + 2)
  }
})

// 生成分享图片
async function generateShareImage() {
  if (!shareCardRef.value) return

  isGenerating.value = true
  try {
    const canvas = await html2canvas(shareCardRef.value, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false
    })

    generatedImage.value = canvas.toDataURL('image/png')
    emit('shared', generatedImage.value)
  } catch (error) {
    console.error('生成分享图片失败:', error)
    alert('生成图片失败，请重试')
  } finally {
    isGenerating.value = false
  }
}

// 下载图片
function downloadImage() {
  if (!generatedImage.value) return

  const link = document.createElement('a')
  link.download = `运势分享_${props.userName || '用户'}_${new Date().toLocaleDateString()}.png`
  link.href = generatedImage.value
  link.click()
}

// 关闭弹窗
function closeModal() {
  generatedImage.value = null
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="share-modal-overlay" @click.self="closeModal">
        <div class="share-modal">
          <div class="modal-header">
            <h3>✨ 生成分享卡片</h3>
            <button class="close-btn" @click="closeModal">✕</button>
          </div>

          <div class="modal-content">
            <!-- 分享卡片预览 -->
            <div ref="shareCardRef" class="share-card">
              <!-- 卡片头部 -->
              <div class="card-header">
                <div class="card-icon">{{ fortuneTypeIcon }}</div>
                <div class="card-title">
                  <h2>{{ fortuneType }}</h2>
                  <p class="card-date">{{ new Date().toLocaleDateString('zh-CN') }}</p>
                </div>
              </div>

              <!-- 用户信息 -->
              <div class="user-info">
                <div class="user-avatar">
                  {{ (userName || '用').charAt(0) }}
                </div>
                <div class="user-details">
                  <p class="user-name">{{ userName || '神秘用户' }}</p>
                  <p class="user-label">今日运势</p>
                </div>
              </div>

              <!-- 运势评分 -->
              <div class="fortune-score">
                <div
                  class="score-circle"
                  :style="{
                    background: `conic-gradient(${luckyColor.hex} ${fortuneScore * 3.6}deg, #f0f0f0 0deg)`
                  }"
                >
                  <div class="score-inner">
                    <span class="score-number">{{ fortuneScore }}</span>
                    <span class="score-label">运势分</span>
                  </div>
                </div>
              </div>

              <!-- 运势内容 -->
              <div v-if="result" class="fortune-content">
                <div class="content-section">
                  <h4>🌟 运势概述</h4>
                  <p>{{ result.prediction?.substring(0, 80) }}...</p>
                </div>

                <div class="content-section">
                  <h4>💡 建议指引</h4>
                  <p>{{ result.advice?.substring(0, 80) }}...</p>
                </div>
              </div>

              <!-- 幸运信息 -->
              <div class="lucky-info">
                <div class="lucky-item">
                  <span class="lucky-label">幸运色</span>
                  <div class="lucky-color" :style="{ background: luckyColor.hex }"></div>
                  <span class="lucky-value">{{ luckyColor.name }}</span>
                </div>
                <div class="lucky-item">
                  <span class="lucky-label">幸运数字</span>
                  <span class="lucky-numbers">{{ luckyNumbers.join(', ') }}</span>
                </div>
              </div>

              <!-- 宜忌 -->
              <div class="yi-ji-section">
                <div class="yi-ji-item yi">
                  <span class="yi-ji-label">宜</span>
                  <span class="yi-ji-content">{{ yiJi.yi.join(' · ') }}</span>
                </div>
                <div class="yi-ji-item ji">
                  <span class="yi-ji-label">忌</span>
                  <span class="yi-ji-content">{{ yiJi.ji.join(' · ') }}</span>
                </div>
              </div>

              <!-- 卡片底部 -->
              <div class="card-footer">
                <p class="app-name">🔮 命运占卜</p>
                <p class="app-slogan">探索你的专属命运指引</p>
                <div class="qr-placeholder">
                  <span>扫码测运势</span>
                </div>
              </div>

              <!-- 装饰元素 -->
              <div class="decoration decoration-1"></div>
              <div class="decoration decoration-2"></div>
              <div class="decoration decoration-3"></div>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons">
              <button
                v-if="!generatedImage"
                class="btn-generate"
                :disabled="isGenerating"
                @click="generateShareImage"
              >
                <span v-if="isGenerating" class="loading-spinner"></span>
                {{ isGenerating ? '生成中...' : '📸 生成分享图片' }}
              </button>

              <template v-else>
                <button class="btn-download" @click="downloadImage">💾 下载图片</button>
                <button class="btn-regenerate" @click="generateShareImage">🔄 重新生成</button>
              </template>
            </div>

            <!-- 生成的图片预览 -->
            <div v-if="generatedImage" class="image-preview">
              <img :src="generatedImage" alt="分享卡片" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 弹窗遮罩 */
.share-modal-overlay {
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

/* 弹窗容器 */
.share-modal {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 450px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* 弹窗头部 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-header h3 {
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

/* 弹窗内容 */
.modal-content {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(90vh - 70px);
}

/* 分享卡片 */
.share-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
}

/* 装饰元素 */
.decoration {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.decoration-1 {
  width: 150px;
  height: 150px;
  top: -50px;
  right: -50px;
}

.decoration-2 {
  width: 100px;
  height: 100px;
  bottom: 100px;
  left: -30px;
}

.decoration-3 {
  width: 60px;
  height: 60px;
  bottom: 50px;
  right: 30px;
  background: rgba(255, 255, 255, 0.15);
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.card-icon {
  font-size: 2.5rem;
}

.card-title h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
}

.card-date {
  margin: 4px 0 0;
  font-size: 0.85rem;
  opacity: 0.9;
}

/* 用户信息 */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.user-details {
  flex: 1;
}

.user-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.user-label {
  margin: 4px 0 0;
  font-size: 0.85rem;
  opacity: 0.9;
}

/* 运势评分 */
.fortune-score {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.score-inner {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #333;
}

.score-number {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
}

.score-label {
  font-size: 0.8rem;
  color: #666;
}

/* 运势内容 */
.fortune-content {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.content-section {
  margin-bottom: 12px;
}

.content-section:last-child {
  margin-bottom: 0;
}

.content-section h4 {
  margin: 0 0 8px;
  font-size: 0.95rem;
  font-weight: 600;
}

.content-section p {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.5;
  opacity: 0.95;
}

/* 幸运信息 */
.lucky-info {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.lucky-item {
  flex: 1;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 12px;
  text-align: center;
}

.lucky-label {
  display: block;
  font-size: 0.8rem;
  opacity: 0.9;
  margin-bottom: 8px;
}

.lucky-color {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin: 0 auto 8px;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.lucky-value {
  font-size: 0.85rem;
  font-weight: 600;
}

.lucky-numbers {
  display: block;
  font-size: 1.2rem;
  font-weight: 700;
  margin-top: 8px;
}

/* 宜忌 */
.yi-ji-section {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.yi-ji-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 10px;
}

.yi-ji-label {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.yi .yi-ji-label {
  background: #4ade80;
  color: white;
}

.ji .yi-ji-label {
  background: #f87171;
  color: white;
}

.yi-ji-content {
  font-size: 0.8rem;
  opacity: 0.95;
}

/* 卡片底部 */
.card-footer {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
}

.app-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.app-slogan {
  margin: 4px 0 12px;
  font-size: 0.8rem;
  opacity: 0.9;
}

.qr-placeholder {
  display: inline-block;
  background: white;
  color: #667eea;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.action-buttons button {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-generate {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-generate:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-generate:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-download {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.btn-download:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(17, 153, 142, 0.4);
}

.btn-regenerate {
  background: #f3f4f6;
  color: #4b5563;
}

.btn-regenerate:hover {
  background: #e5e7eb;
}

/* 加载动画 */
.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 图片预览 */
.image-preview {
  margin-top: 20px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.image-preview img {
  width: 100%;
  display: block;
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

.modal-enter-from .share-modal,
.modal-leave-to .share-modal {
  transform: scale(0.9);
}

/* 响应式 */
@media (max-width: 480px) {
  .share-modal {
    margin: 10px;
  }

  .share-card {
    padding: 16px;
  }

  .card-icon {
    font-size: 2rem;
  }

  .card-title h2 {
    font-size: 1.1rem;
  }

  .score-circle {
    width: 100px;
    height: 100px;
  }

  .score-inner {
    width: 85px;
    height: 85px;
  }

  .score-number {
    font-size: 1.5rem;
  }
}
</style>
