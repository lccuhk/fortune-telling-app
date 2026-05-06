<script setup>
import { ref, computed } from 'vue'

const ENABLE_LOGS = true
const logger = {
  log: (...args) => ENABLE_LOGS && console.log(...args),
  warn: (...args) => ENABLE_LOGS && console.warn(...args),
  error: (...args) => ENABLE_LOGS && console.error(...args)
}

logger.log('✅ [HePanAnalysis] 合盘分析组件已加载！')

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['analyze-hepan'])

// 合盘类型
const hePanType = ref('marriage') // marriage: 合婚, partnership: 合伙, wealth: 合财
const hePanTypes = [
  { value: 'marriage', label: '💕 合婚分析', desc: '分析双方婚姻匹配度' },
  { value: 'partnership', label: '🤝 合伙分析', desc: '分析合作事业契合度' },
  { value: 'wealth', label: '💰 合财分析', desc: '分析财运配合度' }
]

// 第一人信息
const person1 = ref({
  name: '',
  birthDate: '',
  birthTime: '',
  gender: '男',
  birthLocation: ''
})

// 第二人信息
const person2 = ref({
  name: '',
  birthDate: '',
  birthTime: '',
  gender: '女',
  birthLocation: ''
})

// 错误信息
const error = ref('')

// 验证表单
function validateForm() {
  logger.log('🔍 [合盘] 开始验证表单')
  
  if (!person1.value.name.trim() || !person1.value.birthDate) {
    error.value = '请填写第一人的姓名和出生日期！'
    logger.warn('🔍 [合盘] 第一人信息不完整')
    return false
  }
  
  if (!person2.value.name.trim() || !person2.value.birthDate) {
    error.value = '请填写第二人的姓名和出生日期！'
    logger.warn('🔍 [合盘] 第二人信息不完整')
    return false
  }
  
  if (hePanType.value === 'marriage' && person1.value.gender === person2.value.gender) {
    logger.log('⚠️ [合盘] 合婚分析中双方性别相同')
  }
  
  error.value = ''
  logger.log('✅ [合盘] 表单验证通过')
  return true
}

// 提交分析
function handleAnalyze() {
  logger.log('🎯 [合盘] 开始提交分析')
  
  if (!validateForm()) {
    return
  }
  
  const data = {
    analysisType: hePanType.value,
    person1: { ...person1.value },
    person2: { ...person2.value }
  }
  
  logger.log(`🎯 [合盘] 提交数据:`, data)
  emit('analyze-hepan', data)
}

// 重置表单
function resetForm() {
  logger.log('🔄 [合盘] 重置表单')
  person1.value = {
    name: '',
    birthDate: '',
    birthTime: '',
    gender: '男',
    birthLocation: ''
  }
  person2.value = {
    name: '',
    birthDate: '',
    birthTime: '',
    gender: '女',
    birthLocation: ''
  }
  error.value = ''
}

// 快速填充示例数据
function fillExampleData() {
  logger.log('📝 [合盘] 填充示例数据')
  person1.value = {
    name: '张三',
    birthDate: '1990-05-15',
    birthTime: '08:30',
    gender: '男',
    birthLocation: '北京市'
  }
  person2.value = {
    name: '李四',
    birthDate: '1992-08-20',
    birthTime: '14:00',
    gender: '女',
    birthLocation: '上海市'
  }
}
</script>

<template>
  <div class="hepan-analysis-container">
    <h2 class="section-title">💕 多人合盘分析</h2>
    <p class="section-subtitle">输入双方信息，分析八字匹配度</p>
    
    <!-- 合盘类型选择 -->
    <div class="hepan-type-selector">
      <div 
        v-for="type in hePanTypes" 
        :key="type.value"
        :class="['type-card', { active: hePanType === type.value }]"
        @click="hePanType = type.value"
      >
        <div class="type-label">{{ type.label }}</div>
        <div class="type-desc">{{ type.desc }}</div>
      </div>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      ⚠️ {{ error }}
    </div>
    
    <!-- 双方信息输入 -->
    <div class="persons-container">
      <!-- 第一人 -->
      <div class="person-card">
        <div class="person-header">
          <span class="person-icon">👤</span>
          <span class="person-title">第一人</span>
          <span class="gender-badge" :class="person1.gender">{{ person1.gender }}</span>
        </div>
        
        <div class="form-group">
          <label>姓名：</label>
          <input 
            type="text" 
            v-model="person1.name"
            placeholder="请输入姓名"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label>性别：</label>
          <div class="gender-selector">
            <button 
              :class="['gender-btn', { active: person1.gender === '男' }]"
              @click="person1.gender = '男'"
            >
              👨 男
            </button>
            <button 
              :class="['gender-btn', { active: person1.gender === '女' }]"
              @click="person1.gender = '女'"
            >
              👩 女
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label>出生日期：</label>
          <input 
            type="date" 
            v-model="person1.birthDate"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label>出生时间：</label>
          <input 
            type="time" 
            v-model="person1.birthTime"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label>出生地点：</label>
          <input 
            type="text" 
            v-model="person1.birthLocation"
            placeholder="例如：北京市"
            class="form-input"
          />
        </div>
      </div>
      
      <!-- 连接符号 -->
      <div class="connection-symbol">
        <div class="heart">💕</div>
        <div class="vs-text">VS</div>
      </div>
      
      <!-- 第二人 -->
      <div class="person-card">
        <div class="person-header">
          <span class="person-icon">👤</span>
          <span class="person-title">第二人</span>
          <span class="gender-badge" :class="person2.gender">{{ person2.gender }}</span>
        </div>
        
        <div class="form-group">
          <label>姓名：</label>
          <input 
            type="text" 
            v-model="person2.name"
            placeholder="请输入姓名"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label>性别：</label>
          <div class="gender-selector">
            <button 
              :class="['gender-btn', { active: person2.gender === '男' }]"
              @click="person2.gender = '男'"
            >
              👨 男
            </button>
            <button 
              :class="['gender-btn', { active: person2.gender === '女' }]"
              @click="person2.gender = '女'"
            >
              👩 女
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label>出生日期：</label>
          <input 
            type="date" 
            v-model="person2.birthDate"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label>出生时间：</label>
          <input 
            type="time" 
            v-model="person2.birthTime"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label>出生地点：</label>
          <input 
            type="text" 
            v-model="person2.birthLocation"
            placeholder="例如：上海市"
            class="form-input"
          />
        </div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="action-buttons">
      <button class="btn-secondary" @click="fillExampleData">
        📝 示例数据
      </button>
      <button class="btn-secondary" @click="resetForm">
        🔄 重置
      </button>
      <button 
        class="btn-primary" 
        @click="handleAnalyze"
        :disabled="props.loading"
      >
        {{ props.loading ? '✨ 分析中...' : '🔮 开始合盘分析' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.hepan-analysis-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.section-title {
  color: #667eea;
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 10px;
}

.section-subtitle {
  color: #666;
  text-align: center;
  margin-bottom: 25px;
  font-size: 0.95rem;
}

/* 合盘类型选择 */
.hepan-type-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 25px;
}

.type-card {
  background: #f8f9fa;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.type-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.type-card.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
}

.type-label {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 5px;
}

.type-desc {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* 错误提示 */
.error-message {
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 600;
}

/* 双方信息容器 */
.persons-container {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  align-items: start;
}

/* 个人信息卡片 */
.person-card {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.person-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e5e7eb;
}

.person-icon {
  font-size: 1.5rem;
}

.person-title {
  font-weight: 600;
  color: #333;
  flex: 1;
}

.gender-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.gender-badge.男 {
  background: #dbeafe;
  color: #1e40af;
}

.gender-badge.女 {
  background: #fce7f3;
  color: #9d174d;
}

/* 表单样式 */
.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #555;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #667eea;
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 性别选择器 */
.gender-selector {
  display: flex;
  gap: 10px;
}

.gender-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  background: white;
  transition: all 0.3s ease;
  color: #555;
}

.gender-btn:hover {
  border-color: #667eea;
}

.gender-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

/* 连接符号 */
.connection-symbol {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.heart {
  font-size: 2rem;
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.vs-text {
  font-size: 0.8rem;
  color: #999;
  margin-top: 5px;
  font-weight: 600;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 25px;
}

.btn-primary {
  padding: 14px 30px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 14px 20px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  background: #f8f9fa;
  color: #555;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hepan-type-selector {
    grid-template-columns: 1fr;
  }
  
  .persons-container {
    grid-template-columns: 1fr;
  }
  
  .connection-symbol {
    flex-direction: row;
    gap: 10px;
    padding: 10px 0;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
