<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { tanshuApi } from '../services/api.js'
import storageService from '../services/storage.js'

const router = useRouter()
const loading = ref(false)
const result = ref(null)
const selectedDate = ref('')
const useMockData = ref(true)

const shichenList = [
  { name: '子时', time: '23:00-01:00', icon: '🌙', wuxing: '水' },
  { name: '丑时', time: '01:00-03:00', icon: '🌑', wuxing: '土' },
  { name: '寅时', time: '03:00-05:00', icon: '🌅', wuxing: '木' },
  { name: '卯时', time: '05:00-07:00', icon: '🌄', wuxing: '木' },
  { name: '辰时', time: '07:00-09:00', icon: '☀️', wuxing: '土' },
  { name: '巳时', time: '09:00-11:00', icon: '🌤️', wuxing: '火' },
  { name: '午时', time: '11:00-13:00', icon: '🌞', wuxing: '火' },
  { name: '未时', time: '13:00-15:00', icon: '🌥️', wuxing: '土' },
  { name: '申时', time: '15:00-17:00', icon: '🌦️', wuxing: '金' },
  { name: '酉时', time: '17:00-19:00', icon: '🌇', wuxing: '金' },
  { name: '戌时', time: '19:00-21:00', icon: '🌆', wuxing: '土' },
  { name: '亥时', time: '21:00-23:00', icon: '🌃', wuxing: '水' }
]

const wuxingColors = {
  金: '#f59e0b',
  木: '#22c55e',
  水: '#3b82f6',
  火: '#ef4444',
  土: '#a16207'
}

onMounted(() => {
  checkApiConfig()
  const today = new Date()
  selectedDate.value = today.toISOString().split('T')[0]
  getHuangli()
})

function checkApiConfig() {
  useMockData.value = !storageService.apiKey.isConfigured()
}

function goBack() {
  router.push('/')
}

function getMockHuangli(dateStr) {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekDay = date.getDay()

  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

  const tiangan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  const dizhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

  const yearTG = tiangan[(year - 4) % 10]
  const yearDZ = dizhi[(year - 4) % 12]

  const yijis = [
    { yi: ['嫁娶', '祭祀', '祈福', '求嗣', '开光'], ji: ['动土', '破土', '安葬', '开市'] },
    { yi: ['开市', '交易', '立券', '纳财', '开光'], ji: ['嫁娶', '移徙', '入宅', '安葬'] },
    { yi: ['祭祀', '祈福', '求嗣', '开光', '出行'], ji: ['动土', '破土', '修造', '安葬'] },
    { yi: ['嫁娶', '纳采', '订盟', '祭祀', '祈福'], ji: ['开市', '交易', '立券', '纳财'] },
    { yi: ['修造', '动土', '起基', '上梁', '盖屋'], ji: ['嫁娶', '开市', '出行', '移徙'] }
  ]

  const yiji = yijis[Math.floor(Math.random() * yijis.length)]

  const jixiong = ['大吉', '吉', '中', '小吉']
  const jixiongColors = ['#16a34a', '#22c55e', '#eab308', '#84cc16']
  const jixiongIndex = Math.floor(Math.random() * 4)

  const taishen = ['占门厕外正北', '占房床外正东', '占厨灶炉外正南', '占门厕外正西', '占房床内正北']
  const wuxing = [
    '金箔金',
    '天河水',
    '大驿土',
    '钗钏金',
    '桑柘木',
    '大溪水',
    '沙中土',
    '天上火',
    '石榴木',
    '大海水'
  ]

  const shichenJixiong = shichenList.map(sc => ({
    ...sc,
    jixiong: jixiong[Math.floor(Math.random() * 4)],
    color: jixiongColors[Math.floor(Math.random() * 4)]
  }))

  return {
    date: dateStr,
    year: year,
    month: month,
    day: day,
    weekDay: weekDays[weekDay],
    lunarYear: `${yearTG}${yearDZ}年`,
    lunarMonth: `${dizhi[(month + 1) % 12]}月`,
    lunarDay: `${Math.floor(Math.random() * 29) + 1}日`,
    yi: yiji.yi,
    ji: yiji.ji,
    taishen: taishen[Math.floor(Math.random() * taishen.length)],
    wuxing: wuxing[Math.floor(Math.random() * wuxing.length)],
    chong: `冲${dizhi[Math.floor(Math.random() * 12)]}(${dizhi[Math.floor(Math.random() * 12)]})`,
    sha: `煞${['东', '南', '西', '北'][Math.floor(Math.random() * 4)]}`,
    jixiong: jixiong[jixiongIndex],
    jixiongColor: jixiongColors[jixiongIndex],
    shichen: shichenJixiong,
    isMock: true
  }
}

async function getHuangli() {
  if (!selectedDate.value) {
    alert('请选择日期！')
    return
  }

  loading.value = true
  try {
    if (useMockData.value) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      result.value = getMockHuangli(selectedDate.value)
    } else {
      try {
        const apiResult = await tanshuApi.getHuangli(selectedDate.value)
        if (apiResult && apiResult.code === 1 && apiResult.data) {
          const data = apiResult.data
          result.value = {
            date: selectedDate.value,
            year: new Date(selectedDate.value).getFullYear(),
            month: new Date(selectedDate.value).getMonth() + 1,
            day: new Date(selectedDate.value).getDate(),
            weekDay: data.weekday || '',
            lunarYear: data.lunar_year || '',
            lunarMonth: data.lunar_month || '',
            lunarDay: data.lunar_day || '',
            yi: (data.yi || '').split(' ').filter(Boolean),
            ji: (data.ji || '').split(' ').filter(Boolean),
            taishen: data.taishen || '',
            wuxing: data.wuxing || '',
            chong: data.chong || '',
            sha: data.sha || '',
            jixiong: '中',
            jixiongColor: '#eab308',
            shichen: shichenList.map(sc => ({
              ...sc,
              jixiong: '中',
              color: '#eab308'
            })),
            isMock: false
          }
        } else {
          throw new Error('API 返回数据格式不正确')
        }
      } catch (apiError) {
        console.warn('[Huangli] API 请求失败，使用模拟数据:', apiError)
        await new Promise(resolve => setTimeout(resolve, 500))
        result.value = getMockHuangli(selectedDate.value)
      }
    }
  } catch (err) {
    console.error('[Huangli] 获取黄历失败:', err)
    alert('获取黄历失败，请重试')
  } finally {
    loading.value = false
  }
}

function goToday() {
  const today = new Date()
  selectedDate.value = today.toISOString().split('T')[0]
  getHuangli()
}

function goTomorrow() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  selectedDate.value = tomorrow.toISOString().split('T')[0]
  getHuangli()
}

function goYesterday() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  selectedDate.value = yesterday.toISOString().split('T')[0]
  getHuangli()
}

const formattedDate = computed(() => {
  if (!result.value) return ''
  const d = new Date(selectedDate.value)
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
  return d.toLocaleDateString('zh-CN', options)
})
</script>

<template>
  <div class="huangli-page">
    <header class="page-header">
      <button class="back-btn" @click="goBack">← 返回首页</button>
      <h1 class="page-title">📅 黄历</h1>
      <p class="page-subtitle">每日宜忌 · 时辰吉凶</p>
    </header>

    <div class="main-section">
      <div class="date-selector">
        <div class="quick-buttons">
          <button class="quick-btn" @click="goYesterday">昨天</button>
          <button class="quick-btn active" @click="goToday">今天</button>
          <button class="quick-btn" @click="goTomorrow">明天</button>
        </div>
        <div class="date-picker-wrapper">
          <input v-model="selectedDate" type="date" class="date-picker" @change="getHuangli" />
          <button class="refresh-btn" :disabled="loading" @click="getHuangli">
            {{ loading ? '加载中...' : '查询' }}
          </button>
        </div>
      </div>

      <div v-if="useMockData && result" class="mock-notice">
        <span class="mock-icon">🔧</span>
        <span>当前使用模拟数据，配置 API Key 后可获取真实黄历数据</span>
      </div>

      <div v-if="loading" class="loading-section">
        <div class="loading-spinner"></div>
        <p>正在加载黄历...</p>
      </div>

      <div v-else-if="result" class="result-section">
        <div class="date-card">
          <div class="date-main">
            <span class="date-day">{{ result.day }}</span>
            <div class="date-info">
              <span class="date-month">{{ result.year }}年{{ result.month }}月</span>
              <span class="date-week">{{ result.weekDay }}</span>
            </div>
          </div>
          <div class="lunar-info">
            <span class="lunar-year">{{ result.lunarYear }}</span>
            <span class="lunar-date">{{ result.lunarMonth }} {{ result.lunarDay }}</span>
          </div>
          <div class="jixiong-badge" :style="{ background: result.jixiongColor }">
            {{ result.jixiong }}
          </div>
        </div>

        <div class="yiji-section">
          <div class="yi-section">
            <div class="section-header">
              <span class="section-icon">✅</span>
              <span class="section-title">宜</span>
            </div>
            <div class="yiji-tags">
              <span v-for="(item, index) in result.yi" :key="index" class="yi-tag">
                {{ item }}
              </span>
            </div>
          </div>

          <div class="ji-section">
            <div class="section-header">
              <span class="section-icon">❌</span>
              <span class="section-title">忌</span>
            </div>
            <div class="yiji-tags">
              <span v-for="(item, index) in result.ji" :key="index" class="ji-tag">
                {{ item }}
              </span>
            </div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">五行</span>
            <span class="info-value">{{ result.wuxing }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">胎神</span>
            <span class="info-value">{{ result.taishen }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">冲煞</span>
            <span class="info-value">{{ result.chong }} {{ result.sha }}</span>
          </div>
        </div>

        <div class="shichen-section">
          <h3 class="shichen-title">⏰ 时辰吉凶</h3>
          <div class="shichen-grid">
            <div v-for="(sc, index) in result.shichen" :key="index" class="shichen-card">
              <div class="shichen-header">
                <span class="shichen-icon">{{ sc.icon }}</span>
                <span class="shichen-name">{{ sc.name }}</span>
              </div>
              <span class="shichen-time">{{ sc.time }}</span>
              <div class="shichen-footer">
                <span class="shichen-wuxing" :style="{ color: wuxingColors[sc.wuxing] }">
                  {{ sc.wuxing }}
                </span>
                <span class="shichen-jixiong" :style="{ background: sc.color }">
                  {{ sc.jixiong }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="result.isMock" class="mock-badge-wrapper">
          <span class="mock-badge">模拟数据</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.huangli-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 20px;
  position: relative;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 0;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.page-title {
  color: white;
  font-size: 2rem;
  margin-bottom: 10px;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
}

.main-section {
  max-width: 700px;
  margin: 0 auto;
}

.date-selector {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.quick-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.quick-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid #fce7f3;
  border-radius: 10px;
  background: white;
  color: #db2777;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.quick-btn:hover {
  background: #fdf2f8;
  border-color: #f9a8d4;
}

.quick-btn.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border-color: transparent;
}

.date-picker-wrapper {
  display: flex;
  gap: 10px;
}

.date-picker {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #fce7f3;
  border-radius: 10px;
  font-size: 1rem;
  color: #831843;
  background: #fdf2f8;
  cursor: pointer;
  transition: all 0.3s ease;
}

.date-picker:focus {
  outline: none;
  border-color: #f093fb;
  box-shadow: 0 0 0 3px rgba(240, 147, 251, 0.1);
}

.refresh-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 87, 108, 0.4);
}

.refresh-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.mock-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fef3c7;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  color: #92400e;
}

.mock-icon {
  font-size: 1.2rem;
}

.loading-section {
  background: white;
  border-radius: 16px;
  padding: 60px 20px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #fce7f3;
  border-top-color: #f093fb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-section p {
  color: #831843;
  margin: 0;
}

.result-section {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  position: relative;
}

.date-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 16px;
  margin-bottom: 25px;
  color: white;
}

.date-main {
  display: flex;
  align-items: center;
  gap: 20px;
}

.date-day {
  font-size: 4rem;
  font-weight: 700;
  line-height: 1;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.date-month {
  font-size: 1.2rem;
  opacity: 0.95;
}

.date-week {
  font-size: 1rem;
  opacity: 0.85;
}

.lunar-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: right;
}

.lunar-year {
  font-size: 1rem;
  opacity: 0.9;
}

.lunar-date {
  font-size: 1.1rem;
  font-weight: 500;
}

.jixiong-badge {
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 1.1rem;
}

.yiji-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 25px;
}

.yi-section,
.ji-section {
  padding: 20px;
  border-radius: 16px;
}

.yi-section {
  background: #ecfdf5;
}

.ji-section {
  background: #fef2f2;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.section-icon {
  font-size: 1.5rem;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 700;
}

.yi-section .section-title {
  color: #059669;
}

.ji-section .section-title {
  color: #dc2626;
}

.yiji-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.yi-tag,
.ji-tag {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.yi-tag {
  background: #d1fae5;
  color: #059669;
}

.ji-tag {
  background: #fee2e2;
  color: #dc2626;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 25px;
  padding: 20px;
  background: #fdf2f8;
  border-radius: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: center;
}

.info-label {
  font-size: 0.85rem;
  color: #9d174d;
  font-weight: 500;
}

.info-value {
  font-size: 0.95rem;
  color: #831843;
  font-weight: 600;
}

.shichen-section {
  margin-bottom: 20px;
}

.shichen-title {
  color: #831843;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.shichen-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.shichen-card {
  padding: 15px 10px;
  background: #fdf2f8;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
}

.shichen-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(240, 147, 251, 0.2);
}

.shichen-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 8px;
}

.shichen-icon {
  font-size: 1.2rem;
}

.shichen-name {
  font-weight: 600;
  color: #831843;
}

.shichen-time {
  font-size: 0.75rem;
  color: #9d174d;
  margin-bottom: 8px;
}

.shichen-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
}

.shichen-wuxing {
  font-size: 0.75rem;
  font-weight: 600;
}

.shichen-jixiong {
  padding: 2px 8px;
  border-radius: 10px;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
}

.mock-badge-wrapper {
  text-align: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #fce7f3;
}

.mock-badge {
  padding: 6px 16px;
  background: #fef3c7;
  border-radius: 12px;
  color: #92400e;
  font-size: 0.85rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .huangli-page {
    padding: 15px;
  }

  .back-btn {
    position: static;
    margin-bottom: 15px;
    width: 100%;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .result-section {
    padding: 20px;
  }

  .date-card {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .date-main {
    flex-direction: column;
    gap: 10px;
  }

  .lunar-info {
    text-align: center;
  }

  .yiji-section {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .shichen-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .shichen-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .quick-buttons {
    flex-direction: column;
  }

  .date-picker-wrapper {
    flex-direction: column;
  }
}
</style>
