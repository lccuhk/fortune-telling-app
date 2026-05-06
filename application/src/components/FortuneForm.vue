<!-- Fortune Form Component -->
<script setup>
import { ref, computed, reactive, watch } from 'vue'

// 日志开关 - 与 App.vue 保持一致
const ENABLE_LOGS = true;

// 日志工具函数
const logger = {
  log: (...args) => ENABLE_LOGS && console.log(...args),
  warn: (...args) => ENABLE_LOGS && console.warn(...args),
  error: (...args) => ENABLE_LOGS && console.error(...args),
  info: (...args) => ENABLE_LOGS && console.info(...args),
  debug: (...args) => ENABLE_LOGS && console.debug(...args)
};

// 测试日志
logger.log('✅ [FortuneForm] 组件已加载！');

// Props - 合并所有 props
const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  isTarotMode: {
    type: Boolean,
    default: false
  }
});

// 本地模式状态
const localIsTarotMode = ref(props.isTarotMode);
// 存储传统模式下的最后选择（fortune/bazi/ziwei）
let lastTraditionalMode = 'fortune';

// 防止循环同步的标志
let isSyncingFromProp = false;

// 监听 prop 变化，同步内部状态
watch(() => props.isTarotMode, (newVal) => {
  isSyncingFromProp = true;
  localIsTarotMode.value = newVal;
  logger.log('🔄 [组件] 收到父组件模式变化：', newVal);
  // 根据父组件传来的状态，同步内部的 fortuneMode
  if (newVal && fortuneMode.value !== 'tarot') {
    // 保存当前传统模式选择
    if (fortuneMode.value !== 'tarot') {
      lastTraditionalMode = fortuneMode.value;
    }
    fortuneMode.value = 'tarot';
    logger.log('🔄 [组件] 同步内部模式为 tarot');
  } else if (!newVal && fortuneMode.value === 'tarot') {
    // 切回传统模式，恢复之前的选择
    fortuneMode.value = lastTraditionalMode;
    logger.log('🔄 [组件] 同步内部模式为 ' + lastTraditionalMode);
  }
  isSyncingFromProp = false;
});

const emit = defineEmits(['get-fortune', 'draw-tarot', 'get-bazi', 'get-ziwei', 'get-shengxiao', 'get-xingzuo', 'get-xingming', 'get-jiemeng', 'change-mode', 'get-hepan'])

// 表单数据 - 初始值从 prop 来
const fortuneMode = ref(props.isTarotMode ? 'tarot' : 'fortune')
const name = ref('')
const birthDate = ref('')
const birthTime = ref('')
const gender = ref('男')
const question = ref('')
const questionType = ref('综合')
const error = ref('')

// 监听模式变化，发出事件（但防止循环同步）
watch(fortuneMode, (newMode) => {
  if (isSyncingFromProp) return; // 如果是从 prop 同步来的，不发出事件
  
  // 保存传统模式下的选择
  if (newMode !== 'tarot') {
    lastTraditionalMode = newMode;
  }
  
  const isTarot = newMode === 'tarot';
  localIsTarotMode.value = isTarot;
  logger.log('🔄 [表单] 表单模式切换为：', newMode);
  emit('change-mode', isTarot);
});

// 问题类型
const questionTypes = ['综合', '事业', '感情', '财运', '健康', '学业', '爱情']
const baziQuestionTypes = ['综合', '事业', '财运', '感情', '健康', '性格']
const ziweiQuestionTypes = ['综合', '事业', '财运', '感情', '健康']
const shengxiaoQuestionTypes = ['年度运势', '财运', '感情', '事业', '健康', '贵人运']
const xingzuoQuestionTypes = ['今日运势', '本周运势', '本月运势', '年度运势', '爱情', '事业']
const xingmingQuestionTypes = ['五格分析', '性格分析', '事业运', '财运', '健康运', '人际关系']
const jiemengQuestionTypes = ['情感类', '事业类', '财运类', '健康类', '人际关系', '其他']

// 塔罗牌相关
const cardImage = ref('')

// 颜色映射
const elementColors = {
  '白羊座': '#ff6b6b',
  '金牛座': '#ffd93d',
  '双子座': '#6bcb77',
  '巨蟹座': '#4d96ff',
  '狮子座': '#f08a5d',
  '处女座': '#a8e6cf',
  '天秤座': '#ffd93d',
  '天蝎座': '#b83b5e',
  '射手座': '#6a2c70',
  '摩羯座': '#325096',
  '水瓶座': '#38b6ff',
  '双鱼座': '#ffb5e8'
}

// 塔罗牌数据
const tarotCards = [
  { id: '0', name: '愚者', meaning: '新的开始、冒险、天真、潜力', image: '🃏' },
  { id: 'I', name: '魔术师', meaning: '意志力、技能、专注、潜力', image: '🎩' },
  { id: 'II', name: '女祭司', meaning: '直觉、神秘、智慧、内心', image: '🌙' },
  { id: 'III', name: '女皇', meaning: '丰饶、母性、自然、创造力', image: '👑' },
  { id: 'IV', name: '皇帝', meaning: '权威、稳定、秩序、责任', image: '🏛️' },
  { id: 'V', name: '教皇', meaning: '传统、信仰、教导、精神', image: '⛪' },
  { id: 'VI', name: '恋人', meaning: '选择、爱、和谐、关系', image: '❤️' },
  { id: 'VII', name: '战车', meaning: '胜利、决心、自我控制、成功', image: '🏆' }
]

// 获取颜色函数
function getElementColor() {
  const zodiacSign = calculateZodiac(birthDate.value)
  return elementColors[zodiacSign] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
}

// 计算星座
function calculateZodiac(date) {
  if (!date) return '摩羯座'
  const d = new Date(date)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const signs = ['摩羯座', '水瓶座', '双鱼座', '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座']
  const days = [20,19,21,20,21,22,23,23,23,24,23,22]
  
  return day < days[month - 1] ? signs[month - 1] : signs[month]
}

// 重置表单
function resetForm() {
  logger.log('🔄 [表单] 重置表单');
  name.value = ''
  birthDate.value = ''
  birthTime.value = ''
  gender.value = '男'
  question.value = ''
  questionType.value = '综合'
  error.value = ''
}

// 八字算命提交
function handleGetBazi() {
  logger.log('🎯 [八字] 开始八字算命提交');
  if (!name.value.trim() || !birthDate.value || !birthTime.value) {
    logger.warn('🔍 [验证] 验证失败 - 姓名、出生日期或时间为空');
    error.value = '请填写姓名、出生日期和出生时间！'
    return
  }
  logger.log(`🎯 [八字] 验证通过 - 姓名: ${name.value}, 日期: ${birthDate.value}, 时间: ${birthTime.value}`);
  emit('get-bazi', {
    name: name.value,
    birthDate: birthDate.value,
    birthTime: birthTime.value,
    questionType: questionType.value
  });
}

// 紫微斗数提交
function handleGetZiwei() {
  logger.log('⭐ [紫微] 开始紫微斗数提交');
  if (!name.value.trim() || !birthDate.value || !birthTime.value) {
    logger.warn('🔍 [验证] 验证失败 - 姓名、出生日期或时间为空');
    error.value = '请填写姓名、出生日期和出生时间！'
    return
  }
  logger.log(`⭐ [紫微] 验证通过 - 姓名: ${name.value}, 日期: ${birthDate.value}, 时间: ${birthTime.value}, 性别: ${gender.value}`);
  emit('get-ziwei', {
    name: name.value,
    birthDate: birthDate.value,
    birthTime: birthTime.value,
    gender: gender.value,
    questionType: questionType.value
  });
}

// 暴露方法供父组件调用
function getFortune() {
  if (!name.value.trim() || !birthDate.value) {
    logger.warn('🔍 [验证] 验证失败 - 姓名或出生日期为空');
    error.value = '请填写姓名和出生日期！'
    return
  }
  if (questionType.value === '综合' && !question.value.trim()) {
    logger.warn('🔍 [验证] 验证失败 - 综合类型需要填写具体问题');
    error.value = '请填写具体问题！'
    return
  }
  return {
    name: name.value,
    birthDate: birthDate.value,
    question: question.value,
    questionType: questionType.value
  }
}

// 传统算命提交
function handleGetFortune() {
  logger.log('🔮 [算命] 开始传统算命提交');
  const validationResult = getFortune();
  if (validationResult) {
    logger.log(`🔮 [算命] 验证通过 - 姓名: ${validationResult.name}, 问题类型: ${validationResult.questionType}`);
    emit('get-fortune', validationResult);
  }
}

// 塔罗牌抽牌提交
function handleDrawTarot() {
  console.log('=== 🔔 测试：handleDrawTarot 被调用了！ ===');
  logger.log('🎴 [塔罗] 开始塔罗牌抽牌');
  if (!name.value.trim() || !birthDate.value) {
    logger.warn('🔍 [验证] 验证失败 - 姓名或出生日期为空');
    error.value = '请填写姓名和出生日期！';
    return;
  }
  logger.log(`🎴 [塔罗] 验证通过 - 姓名: ${name.value}, 问题: ${question.value || '未提供'}`);
  emit('draw-tarot', {
    name: name.value,
    birthDate: birthDate.value,
    question: question.value
  });
  console.log('=== 🔔 draw-tarot 事件已发出！ ===');
}

// 生肖运势提交
function handleGetShengxiao() {
  logger.log('🐲 [生肖] 开始生肖运势分析');
  if (!name.value.trim() || !birthDate.value) {
    logger.warn('🔍 [验证] 验证失败 - 姓名或出生日期为空');
    error.value = '请填写姓名和出生日期！';
    return;
  }
  logger.log(`🐲 [生肖] 验证通过 - 姓名: ${name.value}, 日期: ${birthDate.value}`);
  emit('get-shengxiao', {
    name: name.value,
    birthDate: birthDate.value,
    questionType: questionType.value
  });
}

// 星座运势提交
function handleGetXingzuo() {
  logger.log('⭐ [星座] 开始星座运势分析');
  if (!name.value.trim() || !birthDate.value) {
    logger.warn('🔍 [验证] 验证失败 - 姓名或出生日期为空');
    error.value = '请填写姓名和出生日期！';
    return;
  }
  logger.log(`⭐ [星座] 验证通过 - 姓名: ${name.value}, 日期: ${birthDate.value}`);
  emit('get-xingzuo', {
    name: name.value,
    birthDate: birthDate.value,
    questionType: questionType.value
  });
}

// 姓名学提交
function handleGetXingming() {
  logger.log('📝 [姓名] 开始姓名学分析');
  if (!name.value.trim()) {
    logger.warn('🔍 [验证] 验证失败 - 姓名为空');
    error.value = '请填写姓名！';
    return;
  }
  logger.log(`📝 [姓名] 验证通过 - 姓名: ${name.value}`);
  emit('get-xingming', {
    name: name.value,
    birthDate: birthDate.value,
    questionType: questionType.value
  });
}

// 周公解梦提交
function handleGetJiemeng() {
  logger.log('💭 [解梦] 开始周公解梦分析');
  if (!question.value.trim()) {
    logger.warn('🔍 [验证] 验证失败 - 梦境内容为空');
    error.value = '请描述您的梦境！';
    return;
  }
  logger.log(`💭 [解梦] 验证通过 - 梦境: ${question.value}`);
  emit('get-jiemeng', {
    name: name.value,
    dream: question.value,
    questionType: questionType.value
  });
}

// 监听模式切换
watch(fortuneMode, (newMode, oldMode) => {
  const modeNames = {
    'fortune': '传统算命',
    'tarot': '塔罗牌占卜',
    'bazi': '八字算命',
    'ziwei': '紫微斗数',
    'shengxiao': '生肖运势',
    'xingzuo': '星座运势',
    'xingming': '姓名学',
    'jiemeng': '周公解梦'
  };
  logger.log(`🔄 [模式] 表单模式切换 - 从 ${modeNames[oldMode]} 切换到 ${modeNames[newMode]}`);
  // 切换模式时重置问题类型
  questionType.value = '综合';
});

// 监听问题类型切换
watch(questionType, (newType, oldType) => {
  logger.log(`🎯 [问题] 问题类型切换 - 从 ${oldType} 切换到 ${newType}`);
});

</script>

<template>
  <div class="fortune-form-container">
    <!-- 模式选择 - 重新设计为分组式 -->
    <div class="mode-selector-container">
      <!-- 中国传统命理组 -->
      <div class="mode-group">
        <div class="group-label">🇨🇳 中国传统</div>
        <div class="mode-buttons">
          <button
            :class="['mode-btn', { active: fortuneMode === 'fortune' }]"
            @click="fortuneMode = 'fortune'"
            title="传统算命"
          >
            <span class="mode-icon">🔮</span>
            <span class="mode-text">传统</span>
          </button>
          <button
            :class="['mode-btn', { active: fortuneMode === 'bazi' }]"
            @click="fortuneMode = 'bazi'"
            title="八字算命"
          >
            <span class="mode-icon">🎯</span>
            <span class="mode-text">八字</span>
          </button>
          <button
            :class="['mode-btn', { active: fortuneMode === 'ziwei' }]"
            @click="fortuneMode = 'ziwei'"
            title="紫微斗数"
          >
            <span class="mode-icon">⭐</span>
            <span class="mode-text">紫微</span>
          </button>
          <button
            :class="['mode-btn', { active: fortuneMode === 'shengxiao' }]"
            @click="fortuneMode = 'shengxiao'"
            title="生肖运势"
          >
            <span class="mode-icon">🐲</span>
            <span class="mode-text">生肖</span>
          </button>
        </div>
      </div>

      <!-- 西方占星组 -->
      <div class="mode-group">
        <div class="group-label">🌟 西方占星</div>
        <div class="mode-buttons">
          <button
            :class="['mode-btn', { active: fortuneMode === 'xingzuo' }]"
            @click="fortuneMode = 'xingzuo'"
            title="星座运势"
          >
            <span class="mode-icon">♈</span>
            <span class="mode-text">星座</span>
          </button>
          <button
            :class="['mode-btn', { active: fortuneMode === 'tarot' }]"
            @click="fortuneMode = 'tarot'"
            title="塔罗牌占卜"
          >
            <span class="mode-icon">🃏</span>
            <span class="mode-text">塔罗</span>
          </button>
        </div>
      </div>

      <!-- 其他占卜组 -->
      <div class="mode-group">
        <div class="group-label">✨ 其他占卜</div>
        <div class="mode-buttons">
          <button
            :class="['mode-btn', { active: fortuneMode === 'xingming' }]"
            @click="fortuneMode = 'xingming'"
            title="姓名学"
          >
            <span class="mode-icon">✏️</span>
            <span class="mode-text">姓名</span>
          </button>
          <button
            :class="['mode-btn', { active: fortuneMode === 'jiemeng' }]"
            @click="fortuneMode = 'jiemeng'"
            title="周公解梦"
          >
            <span class="mode-icon">💭</span>
            <span class="mode-text">解梦</span>
          </button>
        </div>
      </div>

      <!-- 高级功能组 -->
      <div class="mode-group">
        <div class="group-label">🔥 高级功能</div>
        <div class="mode-buttons">
          <button
            :class="['mode-btn', { active: fortuneMode === 'hepan' }]"
            @click="fortuneMode = 'hepan'"
            title="多人合盘"
          >
            <span class="mode-icon">💑</span>
            <span class="mode-text">合盘</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 传统算命模式 -->
    <div v-if="fortuneMode === 'fortune'" class="form-container">
      <h2 class="section-title">✨ 请输入您的信息</h2>
      
      <div v-if="error" class="error-message">
        ⚠️ {{ error }}
      </div>
      
      <div class="form-content-wrapper">
        <div class="form-group">
          <label for="name">👤 姓名：</label>
          <input 
            type="text" 
            id="name" 
            v-model="name"
            placeholder="请输入您的姓名"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="birthDate">🎂 出生日期：</label>
          <input 
            type="date" 
            id="birthDate" 
            v-model="birthDate"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label>🎯 问题类型：</label>
          <div class="question-types">
            <button 
              v-for="type in questionTypes" 
              :key="type"
              :class="['type-btn', { active: questionType === type }]"
              @click="questionType = type"
            >
              {{ type }}
            </button>
          </div>
        </div>
        
        <div v-if="questionType === '综合'" class="form-group">
          <label for="question">💭 具体问题：</label>
          <input 
            type="text" 
            id="question" 
            v-model="question"
            placeholder="例如：我的未来会怎样？"
            class="form-input"
          />
        </div>
        
        <div class="button-group">
          <button 
            class="btn-primary" 
            @click="handleGetFortune"
            :disabled="props.loading"
            :style="{ background: getElementColor() }"
          >
            {{ props.loading ? '✨ 正在占卜中...' : '🔮 开始算命' }}
          </button>
          <button class="btn-secondary" @click="resetForm">
            🔄 重置
          </button>
        </div>
      </div>
    </div>

    <!-- 八字算命模式 -->
    <div v-else-if="fortuneMode === 'bazi'" class="form-container">
      <h2 class="section-title">🎯 八字算命</h2>
      <p class="form-subtitle">基于天干地支的传统命理分析</p>
      
      <div v-if="error" class="error-message">
        ⚠️ {{ error }}
      </div>
      
      <div class="form-content-wrapper">
        <div class="form-group">
          <label for="baziName">👤 姓名：</label>
          <input 
            type="text" 
            id="baziName" 
            v-model="name"
            placeholder="请输入您的姓名"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="baziBirthDate">🎂 出生日期：</label>
          <input 
            type="date" 
            id="baziBirthDate" 
            v-model="birthDate"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="baziBirthTime">⏰ 出生时间：</label>
          <input 
            type="time" 
            id="baziBirthTime" 
            v-model="birthTime"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label>🎯 问题类型：</label>
          <div class="question-types">
            <button 
              v-for="type in baziQuestionTypes" 
              :key="type"
              :class="['type-btn', { active: questionType === type }]"
              @click="questionType = type"
            >
              {{ type }}
            </button>
          </div>
        </div>
        
        <div class="button-group">
          <button 
            class="btn-primary bazi-btn" 
            @click="handleGetBazi"
            :disabled="props.loading"
            style="background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);"
          >
            {{ props.loading ? '✨ 正在排盘...' : '🎯 八字排盘' }}
          </button>
          <button class="btn-secondary" @click="resetForm">
            🔄 重置
          </button>
        </div>
      </div>
    </div>

    <!-- 紫微斗数模式 -->
    <div v-else-if="fortuneMode === 'ziwei'" class="form-container">
      <h2 class="section-title">⭐ 紫微斗数</h2>
      <p class="form-subtitle">十四主星命盘分析</p>
      
      <div v-if="error" class="error-message">
        ⚠️ {{ error }}
      </div>
      
      <div class="form-content-wrapper">
        <div class="form-group">
          <label for="ziweiName">👤 姓名：</label>
          <input 
            type="text" 
            id="ziweiName" 
            v-model="name"
            placeholder="请输入您的姓名"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="ziweiGender">⚥ 性别：</label>
          <div class="gender-selector">
            <button 
              :class="['gender-btn', { active: gender === '男' }]"
              @click="gender = '男'"
            >
              👨 男
            </button>
            <button 
              :class="['gender-btn', { active: gender === '女' }]"
              @click="gender = '女'"
            >
              👩 女
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label for="ziweiBirthDate">🎂 出生日期：</label>
          <input 
            type="date" 
            id="ziweiBirthDate" 
            v-model="birthDate"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="ziweiBirthTime">⏰ 出生时间：</label>
          <input 
            type="time" 
            id="ziweiBirthTime" 
            v-model="birthTime"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label>🎯 问题类型：</label>
          <div class="question-types">
            <button 
              v-for="type in ziweiQuestionTypes" 
              :key="type"
              :class="['type-btn', { active: questionType === type }]"
              @click="questionType = type"
            >
              {{ type }}
            </button>
          </div>
        </div>
        
        <div class="button-group">
          <button 
            class="btn-primary ziwei-btn" 
            @click="handleGetZiwei"
            :disabled="props.loading"
            style="background: linear-gradient(135deg, #4B0082 0%, #8A2BE2 100%);"
          >
            {{ props.loading ? '✨ 正在排盘...' : '⭐ 紫微排盘' }}
          </button>
          <button class="btn-secondary" @click="resetForm">
            🔄 重置
          </button>
        </div>
      </div>
    </div>

    <!-- 生肖运势模式 -->
    <div v-else-if="fortuneMode === 'shengxiao'" class="form-container">
      <h2 class="section-title">🐲 生肖运势</h2>
      <p class="form-subtitle">基于中国传统生肖的年度运势分析</p>

      <div v-if="error" class="error-message">
        ⚠️ {{ error }}
      </div>

      <div class="form-content-wrapper">
        <div class="form-group">
          <label for="shengxiaoName">👤 姓名：</label>
          <input
            type="text"
            id="shengxiaoName"
            v-model="name"
            placeholder="请输入您的姓名"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="shengxiaoBirthDate">🎂 出生日期：</label>
          <input
            type="date"
            id="shengxiaoBirthDate"
            v-model="birthDate"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>🎯 运势类型：</label>
          <div class="question-types">
            <button
              v-for="type in shengxiaoQuestionTypes"
              :key="type"
              :class="['type-btn', { active: questionType === type }]"
              @click="questionType = type"
            >
              {{ type }}
            </button>
          </div>
        </div>

        <div class="button-group">
          <button
            class="btn-primary shengxiao-btn"
            @click="handleGetShengxiao"
            :disabled="props.loading"
            style="background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%);"
          >
            {{ props.loading ? '✨ 正在分析...' : '🐲 查看生肖运势' }}
          </button>
          <button class="btn-secondary" @click="resetForm">
            🔄 重置
          </button>
        </div>
      </div>
    </div>

    <!-- 星座运势模式 -->
    <div v-else-if="fortuneMode === 'xingzuo'" class="form-container">
      <h2 class="section-title">♈ 星座运势</h2>
      <p class="form-subtitle">基于西方占星学的运势分析</p>

      <div v-if="error" class="error-message">
        ⚠️ {{ error }}
      </div>

      <div class="form-content-wrapper">
        <div class="form-group">
          <label for="xingzuoName">👤 姓名：</label>
          <input
            type="text"
            id="xingzuoName"
            v-model="name"
            placeholder="请输入您的姓名"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="xingzuoBirthDate">🎂 出生日期：</label>
          <input
            type="date"
            id="xingzuoBirthDate"
            v-model="birthDate"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>🎯 运势类型：</label>
          <div class="question-types">
            <button
              v-for="type in xingzuoQuestionTypes"
              :key="type"
              :class="['type-btn', { active: questionType === type }]"
              @click="questionType = type"
            >
              {{ type }}
            </button>
          </div>
        </div>

        <div class="button-group">
          <button
            class="btn-primary xingzuo-btn"
            @click="handleGetXingzuo"
            :disabled="props.loading"
            style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
          >
            {{ props.loading ? '✨ 正在分析...' : '♈ 查看星座运势' }}
          </button>
          <button class="btn-secondary" @click="resetForm">
            🔄 重置
          </button>
        </div>
      </div>
    </div>

    <!-- 姓名学模式 -->
    <div v-else-if="fortuneMode === 'xingming'" class="form-container">
      <h2 class="section-title">📝 姓名学</h2>
      <p class="form-subtitle">基于姓名笔画和五格剖象法的命理分析</p>

      <div v-if="error" class="error-message">
        ⚠️ {{ error }}
      </div>

      <div class="form-content-wrapper">
        <div class="form-group">
          <label for="xingmingName">👤 姓名：</label>
          <input
            type="text"
            id="xingmingName"
            v-model="name"
            placeholder="请输入您的姓名（2-4个汉字）"
            class="form-input"
            maxlength="4"
          />
        </div>

        <div class="form-group">
          <label for="xingmingBirthDate">🎂 出生日期（可选）：</label>
          <input
            type="date"
            id="xingmingBirthDate"
            v-model="birthDate"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>🎯 分析类型：</label>
          <div class="question-types">
            <button
              v-for="type in xingmingQuestionTypes"
              :key="type"
              :class="['type-btn', { active: questionType === type }]"
              @click="questionType = type"
            >
              {{ type }}
            </button>
          </div>
        </div>

        <div class="button-group">
          <button
            class="btn-primary xingming-btn"
            @click="handleGetXingming"
            :disabled="props.loading"
            style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);"
          >
            {{ props.loading ? '✨ 正在分析...' : '📝 姓名分析' }}
          </button>
          <button class="btn-secondary" @click="resetForm">
            🔄 重置
          </button>
        </div>
      </div>
    </div>

    <!-- 周公解梦模式 -->
    <div v-else-if="fortuneMode === 'jiemeng'" class="form-container">
      <h2 class="section-title">💭 周公解梦</h2>
      <p class="form-subtitle">解读梦境背后的含义</p>

      <div v-if="error" class="error-message">
        ⚠️ {{ error }}
      </div>

      <div class="form-content-wrapper">
        <div class="form-group">
          <label for="jiemengName">👤 姓名（可选）：</label>
          <input
            type="text"
            id="jiemengName"
            v-model="name"
            placeholder="请输入您的姓名"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>🎯 梦境类型：</label>
          <div class="question-types">
            <button
              v-for="type in jiemengQuestionTypes"
              :key="type"
              :class="['type-btn', { active: questionType === type }]"
              @click="questionType = type"
            >
              {{ type }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="jiemengDream">💭 梦境描述：</label>
          <textarea
            id="jiemengDream"
            v-model="question"
            placeholder="请详细描述您的梦境..."
            class="form-input"
            rows="4"
          ></textarea>
        </div>

        <div class="button-group">
          <button
            class="btn-primary jiemeng-btn"
            @click="handleGetJiemeng"
            :disabled="props.loading"
            style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);"
          >
            {{ props.loading ? '✨ 正在解梦...' : '💭 开始解梦' }}
          </button>
          <button class="btn-secondary" @click="resetForm">
            🔄 重置
          </button>
        </div>
      </div>
    </div>

    <!-- 多人合盘模式 -->
    <div v-else-if="fortuneMode === 'hepan'" class="form-container">
      <h2 class="section-title">💑 多人合盘</h2>
      <p class="form-subtitle">分析两人的命理匹配度，包括婚姻、合伙、财运等</p>
      
      <div class="hepan-placeholder">
        <div class="hepan-icon">💑</div>
        <h3 class="hepan-title">多人合盘功能</h3>
        <p class="hepan-desc">
          通过分析两人的生辰八字，预测婚姻匹配度、合伙事业前景、财运相合程度等
        </p>
        <button 
          class="btn-primary hepan-btn" 
          @click="emit('get-hepan')"
        >
          💑 开始合盘分析
        </button>
      </div>
    </div>

    <!-- 塔罗牌模式 -->
    <div v-else class="form-container">
      <h2 class="section-title">🃏 塔罗牌占卜</h2>

      <div v-if="error" class="error-message">
        ⚠️ {{ error }}
      </div>

      <div class="form-content-wrapper">
        <div class="form-group">
          <label for="tarotName">👤 姓名：</label>
          <input
            type="text"
            id="tarotName"
            v-model="name"
            placeholder="请输入您的姓名"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="tarotBirthDate">🎂 出生日期：</label>
          <input
            type="date"
            id="tarotBirthDate"
            v-model="birthDate"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="tarotQuestion">💭 问题：</label>
          <textarea
            id="tarotQuestion"
            v-model="question"
            placeholder="请输入您想问的问题..."
            class="form-input"
            rows="3"
          ></textarea>
        </div>

        <div class="button-group">
          <button
            class="btn-primary tarot-btn"
            @click="handleDrawTarot"
            :disabled="props.loading"
          >
            {{ props.loading ? '✨ 正在抽牌...' : '🃏 抽牌占卜' }}
          </button>
          <button class="btn-secondary" @click="resetForm">
            🔄 重置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 表单容器样式 */
.fortune-form-container {
  width: 100%;
}

/* 模式选择器容器 */
.mode-selector-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* 模式分组 */
.mode-group {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  padding: 16px 20px;
  border: 2px solid rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

:global(.dark) .mode-group,
:global(.dark-mode) .mode-group {
  background: rgba(40, 40, 60, 0.7);
  border-color: rgba(255, 255, 255, 0.15);
}

.mode-group:hover {
  background: rgba(255, 255, 255, 0.85);
  border-color: rgba(0, 0, 0, 0.12);
}

:global(.dark) .mode-group:hover,
:global(.dark-mode) .mode-group:hover {
  background: rgba(50, 50, 75, 0.8);
  border-color: rgba(255, 255, 255, 0.25);
}

/* 分组标签 */
.group-label {
  font-size: 0.85rem;
  color: #4b5563;
  margin-bottom: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

:global(.dark) .group-label,
:global(.dark-mode) .group-label {
  color: rgba(255, 255, 255, 0.8);
}

/* 模式按钮容器 */
.mode-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* 模式按钮 */
.mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 16px;
  min-width: 70px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.75rem;
  cursor: pointer;
  background: #ffffff;
  color: #4b5563;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:global(.dark) .mode-btn,
:global(.dark-mode) .mode-btn {
  background: rgba(30, 30, 45, 0.9);
  border-color: rgba(255, 255, 255, 0.2);
  color: #d1d5db;
}

.mode-btn:hover {
  background: #f3f4f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

:global(.dark) .mode-btn:hover,
:global(.dark-mode) .mode-btn:hover {
  background: rgba(50, 50, 70, 0.95);
  border-color: rgba(255, 255, 255, 0.3);
}

.mode-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  border-color: transparent;
}

.mode-btn.active .mode-icon {
  transform: scale(1.1);
}

.mode-icon {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.mode-text {
  font-weight: 500;
  white-space: nowrap;
}

/* 表单容器 */
.form-container {
  background: rgba(255,255,255,0.98);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}

/* 深色模式下的表单容器 - 通过父元素的 dark 类来设置 */
:global(.dark) .form-container,
:global(.dark-mode) .form-container {
  background: rgba(40, 40, 60, 0.98);
  box-shadow: 0 10px 40px rgba(0,0,0,0.4);
}

.form-content-wrapper {
  max-width: 380px;
  margin: 0 auto;
}

.section-title {
  color: #667eea;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 25px;
  text-align: center;
}

:global(.dark) .section-title,
:global(.dark-mode) .section-title {
  color: #a5b4fc;
}

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

:global(.dark) .error-message,
:global(.dark-mode) .error-message {
  background-color: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  color: #fca5a5;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #374151;
  font-weight: 600;
}

:global(.dark) .form-group label,
:global(.dark-mode) .form-group label {
  color: #e5e7eb;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  background: #ffffff;
  color: #1f2937;
  transition: all 0.3s ease;
}

:global(.dark) .form-input,
:global(.dark-mode) .form-input {
  background: rgba(30, 30, 45, 0.9);
  border-color: rgba(255, 255, 255, 0.2);
  color: #f3f4f6;
}

.form-input:focus {
  border-color: #667eea;
  background: #ffffff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(102,126,234,0.15);
}

:global(.dark) .form-input:focus,
:global(.dark-mode) .form-input:focus {
  background: rgba(40, 40, 55, 0.95);
  border-color: #818cf8;
  box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.2);
}

:global(.dark) .form-input::placeholder,
:global(.dark-mode) .form-input::placeholder {
  color: #9ca3af;
}

.question-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 10px;
}

.type-btn {
  padding: 8px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  background: #ffffff;
  transition: all 0.3s ease;
  color: #4b5563;
  font-weight: 500;
}

:global(.dark) .type-btn,
:global(.dark-mode) .type-btn {
  background: rgba(30, 30, 45, 0.9);
  border-color: rgba(255, 255, 255, 0.2);
  color: #d1d5db;
}

.type-btn:hover {
  background: #f3f4f6;
  transform: translateY(-1px);
  border-color: #d1d5db;
}

:global(.dark) .type-btn:hover,
:global(.dark-mode) .type-btn:hover {
  background: rgba(50, 50, 70, 0.9);
  border-color: rgba(255, 255, 255, 0.3);
}

.type-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(102,126,234,0.3);
}

.button-group {
  display: flex;
  gap: 15px;
  margin-top: 25px;
}

.btn-primary {
  flex: 2;
  padding: 16px;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102,126,234,0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 八字按钮样式 */
.bazi-btn {
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%) !important;
}

.bazi-btn:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(139, 69, 19, 0.4) !important;
}

/* 紫微按钮样式 */
.ziwei-btn {
  background: linear-gradient(135deg, #4B0082 0%, #8A2BE2 100%) !important;
}

.ziwei-btn:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(75, 0, 130, 0.4) !important;
}

/* 生肖运势按钮样式 */
.shengxiao-btn {
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%) !important;
}

.shengxiao-btn:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4) !important;
}

/* 星座运势按钮样式 */
.xingzuo-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.xingzuo-btn:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4) !important;
}

/* 姓名学按钮样式 */
.xingming-btn {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%) !important;
}

.xingming-btn:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(17, 153, 142, 0.4) !important;
}

/* 周公解梦按钮样式 */
.jiemeng-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
}

.jiemeng-btn:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(79, 172, 254, 0.4) !important;
}

/* 表单副标题 */
.form-subtitle {
  text-align: center;
  color: #6b7280;
  font-size: 0.95rem;
  margin-top: -15px;
  margin-bottom: 20px;
}

:global(.dark) .form-subtitle,
:global(.dark-mode) .form-subtitle {
  color: #9ca3af;
}

/* 性别选择器 */
.gender-selector {
  display: flex;
  gap: 10px;
}

.gender-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  background: #ffffff;
  transition: all 0.3s ease;
  color: #4b5563;
}

:global(.dark) .gender-btn,
:global(.dark-mode) .gender-btn {
  background: rgba(30, 30, 45, 0.9);
  border-color: rgba(255, 255, 255, 0.2);
  color: #d1d5db;
}

.gender-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

:global(.dark) .gender-btn:hover,
:global(.dark-mode) .gender-btn:hover {
  background: rgba(50, 50, 70, 0.9);
  border-color: rgba(255, 255, 255, 0.3);
}

.gender-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(102,126,234,0.3);
}

.btn-secondary {
  flex: 1;
  padding: 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  background: #ffffff;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.3s ease;
}

:global(.dark) .btn-secondary,
:global(.dark-mode) .btn-secondary {
  background: rgba(30, 30, 45, 0.9);
  border-color: rgba(255, 255, 255, 0.2);
  color: #d1d5db;
}

.btn-secondary:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

:global(.dark) .btn-secondary:hover,
:global(.dark-mode) .btn-secondary:hover {
  background: rgba(50, 50, 70, 0.9);
  border-color: rgba(255, 255, 255, 0.3);
}

/* 合盘占位符样式 */
.hepan-placeholder {
  text-align: center;
  padding: 40px 20px;
}

.hepan-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.hepan-title {
  color: #1f2937;
  margin-bottom: 15px;
  font-size: 1.3rem;
  font-weight: 600;
}

:global(.dark) .hepan-title,
:global(.dark-mode) .hepan-title {
  color: #f3f4f6;
}

.hepan-desc {
  color: #6b7280;
  margin-bottom: 25px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

:global(.dark) .hepan-desc,
:global(.dark-mode) .hepan-desc {
  color: #9ca3af;
}

.hepan-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
  padding: 14px 32px !important;
  font-size: 1.05rem !important;
}

.hepan-btn:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(245, 87, 108, 0.4) !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-container {
    padding: 20px;
  }

  .form-content-wrapper {
    max-width: 100%;
  }

  .question-types {
    grid-template-columns: repeat(2, 1fr);
  }

  .mode-selector-container {
    gap: 15px;
  }

  .mode-group {
    padding: 12px 16px;
  }

  .mode-btn {
    min-width: 60px;
    padding: 10px 12px;
  }

  .mode-icon {
    font-size: 1.3rem;
  }

  .mode-text {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .button-group {
    flex-direction: column;
  }

  .btn-primary, .btn-secondary {
    width: 100%;
  }

  .mode-selector-container {
    gap: 12px;
  }

  .mode-group {
    padding: 10px 12px;
    border-radius: 12px;
  }

  .group-label {
    font-size: 0.75rem;
    margin-bottom: 8px;
  }

  .mode-buttons {
    gap: 8px;
  }

  .mode-btn {
    min-width: 55px;
    padding: 8px 10px;
    border-radius: 10px;
  }

  .mode-icon {
    font-size: 1.2rem;
  }

  .mode-text {
    font-size: 0.65rem;
  }
}
</style>