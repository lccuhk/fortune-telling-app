<script setup>
import { ref, onMounted, computed, nextTick, watch, onUnmounted } from 'vue';
import { Chart, registerables } from 'chart.js';
import FortuneForm from './components/FortuneForm.vue';
import ShareCard from './components/ShareCard.vue';
import './styles/3d-galaxy.css';

// 日志开关 - 设置为 false 可以关闭所有日志
const ENABLE_LOGS = true;
// 部署版本标记 - 用于强制刷新缓存
const DEPLOY_VERSION = '20250424-001';

// 日志工具函数
const logger = {
  log: (...args) => ENABLE_LOGS && console.log(...args),
  warn: (...args) => ENABLE_LOGS && console.warn(...args),
  error: (...args) => ENABLE_LOGS && console.error(...args),
  info: (...args) => ENABLE_LOGS && console.info(...args),
  debug: (...args) => ENABLE_LOGS && console.debug(...args)
};

// Toast 提示函数
function showToast(message, type = 'info', duration = 3000) {
  logger.log(`🍞 [Toast] ${type}: ${message}`);
  
  // 创建 toast 元素
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
    <span class="toast-message">${message}</span>
  `;
  
  // 添加到页面
  document.body.appendChild(toast);
  
  // 触发动画
  nextTick(() => {
    toast.classList.add('show');
  });
  
  // 自动移除
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, duration);
}

// 生成基于当前用户的 localStorage key
function getUserStorageKey(keyName) {
  const username = currentUser.value?.username || 'guest';
  const userKey = `${keyName}_${username}`;
  logger.log('📦 [存储] 生成用户存储 key：', userKey);
  return userKey;
}

// 注册Chart.js
Chart.register(...registerables);

// 图表实例
let pieChart = null;
let barChart = null;
let lineChart = null;

// 统计图表相关
const chartColors = [
  '#667eea', '#764ba2', '#f093fb', '#f5576c',
  '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
  '#fa709a', '#fee140', '#ff9a9e', '#fecfef'
];

// 过滤后的历史记录
const filteredHistory = computed(() => {
  let result = [...history.value];
  
  // 应用搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(item => 
      item.user_name?.toLowerCase().includes(query) ||
      item.question_type?.toLowerCase().includes(query) ||
      item.zodiac_sign?.toLowerCase().includes(query) ||
      item.chinese_zodiac?.toLowerCase().includes(query)
    );
  }
  
  // 应用类型筛选
  if (filterType.value) {
    result = result.filter(item => item.question_type === filterType.value);
  }
  
  return result;
});

// 过滤后的收藏
const filteredFavorites = computed(() => {
  let result = [...favorites.value];
  
  // 应用搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(item => 
      item.user_name?.toLowerCase().includes(query) ||
      item.question_type?.toLowerCase().includes(query) ||
      item.zodiac_sign?.toLowerCase().includes(query) ||
      item.chinese_zodiac?.toLowerCase().includes(query)
    );
  }
  
  // 应用类型筛选
  if (filterType.value) {
    result = result.filter(item => item.question_type === filterType.value);
  }
  
  return result;
});

const name = ref('');
const birthDate = ref('');
const question = ref('');
const questionType = ref('综合');
const result = ref(null);
const loading = ref(false);
const error = ref('');
const history = ref([]);
const favorites = ref([]);
const activeTab = ref('fortune');
const isDarkMode = ref(false); // 主题切换状态
const searchQuery = ref(''); // 搜索关键词
const filterType = ref(''); // 筛选类型

// === 运势变化记录 ===
const fortuneRecords = ref([]);

// 保存运势记录
function saveFortuneRecord(data) {
  const record = {
    id: Date.now(),
    ...data,
    timestamp: new Date().toISOString(),
    dateStr: new Date().toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };
  
  fortuneRecords.value.unshift(record);
  
  // 保存到localStorage
  const storageKey = getUserStorageKey('fortuneRecords');
  localStorage.setItem(storageKey, JSON.stringify(fortuneRecords.value.slice(0, 50)));
  
  logger.log('📝 [运势记录] 已保存新记录:', record);
}

// 加载运势记录
function loadFortuneRecords() {
  const storageKey = getUserStorageKey('fortuneRecords');
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    fortuneRecords.value = JSON.parse(saved);
    logger.log('📝 [运势记录] 已加载', fortuneRecords.value.length, '条记录');
  }
}

// 生成运势评分（用于图表展示）
function calculateFortuneScore(prediction) {
  // 简单的情感分析算法，根据预测文本生成评分
  const positiveWords = ['好', '吉', '顺', '成', '成功', '顺利', '美好', '幸福', '财运', '桃花', '健康'];
  const negativeWords = ['难', '凶', '阻', '困', '困难', '阻碍', '危险', '注意', '小心', '麻烦'];
  
  let score = 50; // 中间值
  
  positiveWords.forEach(word => {
    if (prediction.includes(word)) {
      score += 5;
    }
  });
  
  negativeWords.forEach(word => {
    if (prediction.includes(word)) {
      score -= 5;
    }
  });
  
  return Math.max(0, Math.min(100, score)); // 限制在0-100之间
}

// 用户登录状态
const isLoggedIn = ref(false);
const currentUser = ref(null);
const showLoginModal = ref(false);
const showRegisterModal = ref(false);
const loginUsername = ref('');
const loginPassword = ref('');
const rememberMe = ref(false);

// 从 localStorage 加载记住的登录信息
function loadRememberedLogin() {
  const remembered = localStorage.getItem('rememberedLogin');
  if (remembered) {
    try {
      const data = JSON.parse(remembered);
      loginUsername.value = data.username || '';
      loginPassword.value = data.password || '';
      rememberMe.value = true;
      logger.log('📦 [记住密码] 已加载保存的登录信息');
    } catch (e) {
      logger.error('❌ [记住密码] 加载保存的登录信息失败', e);
    }
  }
}

// 保存登录信息到 localStorage
function saveRememberedLogin() {
  if (rememberMe.value && loginUsername.value && loginPassword.value) {
    const data = {
      username: loginUsername.value,
      password: loginPassword.value,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('rememberedLogin', JSON.stringify(data));
    logger.log('💾 [记住密码] 已保存登录信息');
  } else {
    localStorage.removeItem('rememberedLogin');
    logger.log('🗑️ [记住密码] 已清除保存的登录信息');
  }
}

// 清除记住的登录信息
function clearRememberedLogin() {
  localStorage.removeItem('rememberedLogin');
  rememberMe.value = false;
  logger.log('🗑️ [记住密码] 已清除保存的登录信息');
}

// 计算密码强度
function calculatePasswordStrength(password) {
  if (!password) return { score: 0, level: 'none', label: '未输入' };
  
  let score = 0;
  
  // 长度评分
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (password.length >= 14) score += 1;
  
  // 复杂度评分
  if (/[a-z]/.test(password)) score += 1; // 小写字母
  if (/[A-Z]/.test(password)) score += 1; // 大写字母
  if (/[0-9]/.test(password)) score += 1; // 数字
  if (/[^a-zA-Z0-9]/.test(password)) score += 1; // 特殊字符
  
  // 根据分数确定强度等级
  let level, label, color;
  if (score <= 2) {
    level = 'weak';
    label = '弱';
    color = '#ff6b6b';
  } else if (score <= 4) {
    level = 'medium';
    label = '中';
    color = '#ffd93d';
  } else if (score <= 6) {
    level = 'strong';
    label = '强';
    color = '#6bcf7f';
  } else {
    level = 'very-strong';
    label = '非常强';
    color = '#4ecdc4';
  }
  
  return { score, level, label, color, maxScore: 8 };
}

// 密码强度响应式计算
const passwordStrength = computed(() => calculatePasswordStrength(registerPassword.value));
const registerUsername = ref('');
const registerPassword = ref('');
const registerConfirm = ref('');

// 验证码相关
const captchaCode = ref('');
const captchaInput = ref('');
const captchaCanvas = ref(null);

// 生成随机验证码
function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  captchaCode.value = code;
  drawCaptcha();
  logger.log('🔐 [验证码] 生成新验证码:', code);
  return code;
}

// 绘制验证码图片
function drawCaptcha() {
  if (!captchaCanvas.value) return;
  
  const canvas = captchaCanvas.value;
  const ctx = canvas.getContext('2d');
  const width = 120;
  const height = 40;
  
  canvas.width = width;
  canvas.height = height;
  
  // 填充背景
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, width, height);
  
  // 绘制干扰线
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  // 绘制干扰点
  for (let i = 0; i < 30; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * width, Math.random() * height, 1, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
    ctx.fill();
  }
  
  // 绘制文字
  const code = captchaCode.value;
  for (let i = 0; i < code.length; i++) {
    ctx.save();
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = `rgb(${Math.random() * 100 + 50}, ${Math.random() * 100 + 50}, ${Math.random() * 100 + 50})`;
    ctx.translate(20 + i * 25, 28);
    ctx.rotate((Math.random() - 0.5) * 0.4);
    ctx.fillText(code[i], 0, 0);
    ctx.restore();
  }
}

// 验证验证码
function validateCaptcha() {
  if (!captchaInput.value) {
    return { valid: false, message: '请输入验证码' };
  }
  if (captchaInput.value.toLowerCase() !== captchaCode.value.toLowerCase()) {
    return { valid: false, message: '验证码错误' };
  }
  return { valid: true, message: '' };
}

// 刷新验证码
function refreshCaptcha() {
  captchaInput.value = '';
  generateCaptcha();
}

// 每日运势推送相关
const isPushEnabled = ref(false);
const pushTime = ref('08:00');
const pushTimer = ref(null);
const showSettingsModal = ref(false);

// 分享卡片相关
const showShareCard = ref(false);

// 登录页面相关
const showLoginPage = ref(false);
const authMode = ref('login'); // 'login' or 'register'
const authLoading = ref(false);
const authError = ref('');
const authFieldErrors = ref({
  loginUsername: '',
  loginPassword: '',
  registerUsername: '',
  registerPassword: '',
  registerConfirm: ''
});

// 页面过渡动画相关
const tabTransition = ref('slide-left');
const isPageTransitioning = ref(false);

// 切换标签页带过渡动画
function switchTabWithTransition(newTab) {
  if (newTab === activeTab.value) return;

  // 确定过渡方向
  const tabs = ['fortune', 'history', 'favorites', 'stats'];
  const currentIndex = tabs.indexOf(activeTab.value);
  const newIndex = tabs.indexOf(newTab);
  tabTransition.value = newIndex > currentIndex ? 'slide-left' : 'slide-right';

  // 触发过渡
  isPageTransitioning.value = true;
  setTimeout(() => {
    activeTab.value = newTab;
    isPageTransitioning.value = false;
  }, 50);
}

// 骨架屏显示控制
const showSkeleton = ref(false);
const skeletonType = ref('fortune'); // fortune, history, favorites, stats

// 显示骨架屏
function showSkeletonScreen(type) {
  skeletonType.value = type;
  showSkeleton.value = true;
}

// 隐藏骨架屏
function hideSkeletonScreen() {
  showSkeleton.value = false;
}

// 带骨架屏的数据加载
async function loadDataWithSkeleton(type, loadFunction) {
  showSkeletonScreen(type);
  try {
    await loadFunction();
  } finally {
    // 最小显示时间，避免闪烁
    setTimeout(() => {
      hideSkeletonScreen();
    }, 300);
  }
}

// 清除字段错误
function clearFieldError(field) {
  if (authFieldErrors.value[field]) {
    authFieldErrors.value[field] = '';
  }
}

// 设置字段错误
function setFieldError(field, message) {
  authFieldErrors.value[field] = message;
}

// 清除所有错误
function clearAllAuthErrors() {
  authError.value = '';
  authFieldErrors.value = {
    loginUsername: '',
    loginPassword: '',
    registerUsername: '',
    registerPassword: '',
    registerConfirm: ''
  };
}

const questionTypes = ['综合', '事业', '感情', '财运', '健康', '学业', '爱情'];
// 所有类型（包含塔罗牌占卜，用于筛选）
const allTypes = ['塔罗牌占卜', ...questionTypes];

// 塔罗牌占卜模式
const isTarotMode = ref(false);

// === 3D宇宙星河效果 ===
const galaxyRotation = ref({ x: 0, y: 0 });
let mouseMoveHandler = null;

// 创建星星粒子
function createStars() {
  const container = document.getElementById('galaxy-container');
  if (!container) return;
  
  const starCount = 200;
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    
    const size = Math.random() * 3 + 1;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const z = Math.random() * 100;
    const duration = Math.random() * 4 + 2;
    
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${x}%`;
    star.style.top = `${y}%`;
    star.style.setProperty('--twinkle-duration', `${duration}s`);
    star.style.animationDelay = `${Math.random() * 3}s`;
    star.style.opacity = Math.random() * 0.7 + 0.3;
    
    container.appendChild(star);
  }
}

// 创建星云效果
function createNebulae() {
  const colors = [
    'rgba(102, 126, 234, 0.3)',
    'rgba(118, 75, 162, 0.25)',
    'rgba(240, 147, 251, 0.2)',
    'rgba(245, 87, 108, 0.15)'
  ];
  
  for (let i = 0; i < 6; i++) {
    const nebula = document.createElement('div');
    nebula.className = 'nebula';
    
    const size = Math.random() * 400 + 300;
    nebula.style.width = `${size}px`;
    nebula.style.height = `${size}px`;
    nebula.style.left = `${Math.random() * 100}%`;
    nebula.style.top = `${Math.random() * 100}%`;
    nebula.style.background = colors[i % colors.length];
    nebula.style.animationDelay = `${Math.random() * 10}s`;
    nebula.style.animationDuration = `${Math.random() * 15 + 15}s`;
    
    document.body.appendChild(nebula);
  }
}

// 创建流星效果
function createMeteor() {
  const meteor = document.createElement('div');
  meteor.className = 'meteor';
  
  meteor.style.top = `${Math.random() * 50}%`;
  meteor.style.left = `${Math.random() * 100 + 50}%`;
  meteor.style.animationDuration = `${Math.random() * 2 + 1}s`;
  
  document.body.appendChild(meteor);
  
  setTimeout(() => {
    meteor.remove();
  }, 3000);
}

// 鼠标跟随效果
function setupMouseFollow() {
  const app = document.getElementById('galaxy-app');
  if (!app) return;
  
  mouseMoveHandler = (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 15;
    const y = (e.clientY / window.innerHeight - 0.5) * 15;
    
    galaxyRotation.value = { x, y };
    app.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
  };
  
  window.addEventListener('mousemove', mouseMoveHandler);
}

// 清理事件监听器
function cleanupEffects() {
  if (mouseMoveHandler) {
    window.removeEventListener('mousemove', mouseMoveHandler);
  }
}

// 塔罗牌数据
const tarotCards = [
  { name: '愚者', meaning: '新的开始，冒险，天真' },
  { name: '魔术师', meaning: '创造力，技能，意志力' },
  { name: '女祭司', meaning: '直觉，潜意识，神秘' },
  { name: '皇后', meaning: '丰饶，母性，自然' },
  { name: '皇帝', meaning: '权威，稳定，领导力' },
  { name: '教皇', meaning: '传统，信仰，精神指引' },
  { name: '恋人', meaning: '爱，选择，和谐' },
  { name: '战车', meaning: '意志，自律，成功' },
  { name: '力量', meaning: '勇气，耐心，内心力量' },
  { name: '隐士', meaning: '内省，寻找真理，内心指引' },
  { name: '命运之轮', meaning: '转变，运势，转折点' },
  { name: '正义', meaning: '公平，真相，因果' },
  { name: '倒吊人', meaning: '牺牲，新视角，等待' },
  { name: '死神', meaning: '转变，结束，重生' },
  { name: '节制', meaning: '平衡，耐心，调和' },
  { name: '恶魔', meaning: '束缚，欲望，阴影' },
  { name: '高塔', meaning: '突变，觉醒，破坏' },
  { name: '星星', meaning: '希望，平静，希望' },
  { name: '月亮', meaning: '幻觉，恐惧，潜意识' },
  { name: '太阳', meaning: '乐观，成功，活力' },
  { name: '审判', meaning: '救赎，觉醒，重生' },
  { name: '世界', meaning: '完成，整合，成就' }
];

// 当前抽到的塔罗牌
const drawnTarot = ref(null);

const zodiacSigns = [
  { sign: '白羊座', start: { month: 3, day: 21 }, end: { month: 4, day: 19 } },
  { sign: '金牛座', start: { month: 4, day: 20 }, end: { month: 5, day: 20 } },
  { sign: '双子座', start: { month: 5, day: 21 }, end: { month: 6, day: 21 } },
  { sign: '巨蟹座', start: { month: 6, day: 22 }, end: { month: 7, day: 22 } },
  { sign: '狮子座', start: { month: 7, day: 23 }, end: { month: 8, day: 22 } },
  { sign: '处女座', start: { month: 8, day: 23 }, end: { month: 9, day: 22 } },
  { sign: '天秤座', start: { month: 9, day: 23 }, end: { month: 10, day: 23 } },
  { sign: '天蝎座', start: { month: 10, day: 24 }, end: { month: 11, day: 22 } },
  { sign: '射手座', start: { month: 11, day: 23 }, end: { month: 12, day: 21 } },
  { sign: '摩羯座', start: { month: 12, day: 22 }, end: { month: 1, day: 19 } },
  { sign: '水瓶座', start: { month: 1, day: 20 }, end: { month: 2, day: 18 } },
  { sign: '双鱼座', start: { month: 2, day: 19 }, end: { month: 3, day: 20 } }
];

const elementColors = {
  '事业': '#FFD700',
  '感情': '#FF69B4',
  '财运': '#32CD32',
  '健康': '#00CED1',
  '学业': '#9370DB',
  '爱情': '#FF6B6B',
  '综合': '#8B5CF6'
};

const currentUserName = ref('');

onMounted(() => {
  logger.log('🚀 [初始化] 应用开始加载');
  
  // 初始化3D宇宙星河效果
  logger.log('🌌 [初始化] 创建3D宇宙星河背景');
  nextTick(() => {
    createStars();
    createNebulae();
    setupMouseFollow();
    
    // 定时创建流星
    setInterval(() => {
      if (Math.random() > 0.7) {
        createMeteor();
      }
    }, 3000);
  });
  
  // 加载主题设置
  logger.log('🎨 [初始化] 加载主题设置');
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark';
    logger.log('  - 主题已恢复:', isDarkMode.value ? '深色模式' : '浅色模式');
  } else {
    // 如果没有保存的主题，检测系统主题偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDarkMode.value = prefersDark;
    logger.log('  - 检测到系统主题偏好:', prefersDark ? '深色模式' : '浅色模式');
  }
  
  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    // 只有在用户没有手动设置主题时才自动切换
    if (!localStorage.getItem('theme')) {
      isDarkMode.value = e.matches;
      logger.log('🎨 [主题] 系统主题变化，自动切换到:', e.matches ? '深色模式' : '浅色模式');
    }
  });
  
  // 加载登录状态
  logger.log('🔐 [初始化] 检查登录状态');
  const savedUser = localStorage.getItem('currentUser');
  
  if (savedUser) {
    logger.log('✅ [初始化] 找到已登录的用户');
    currentUser.value = JSON.parse(savedUser);
    isLoggedIn.value = true;
    logger.log('  - 用户信息:', currentUser.value);
    logger.log('  - 登录状态:', isLoggedIn.value);
  } else {
    logger.log('❌ [初始化] 未找到登录用户');
    // 加载记住的登录信息
    loadRememberedLogin();
    logger.log('🚪 [初始化] 显示登录页面');
    showLoginPage.value = true;
  }
  
  // 加载当前用户的所有数据
  loadUserData();
  
  // 加载推送设置
  logger.log('🔔 [初始化] 加载推送设置');
  const savedPushEnabled = localStorage.getItem('pushEnabled');
  if (savedPushEnabled === 'true') {
    isPushEnabled.value = true;
    const savedPushTime = localStorage.getItem('pushTime');
    if (savedPushTime) {
      pushTime.value = savedPushTime;
    }
    logger.log('  - 推送已开启, 时间:', pushTime.value);
    // 如果之前已开启，则恢复定时器
    if (Notification.permission === 'granted') {
      logger.log('  - 通知权限已授予, 恢复定时器');
      setupPushTimer();
    }
  } else {
    logger.log('  - 推送未开启');
  }
  
  // 尝试从服务器加载历史记录
  logger.log('📚 [初始化] 加载历史记录');
  loadHistoryFromServer();
  
  logger.log('🎉 [初始化] 应用加载完成！');
});

// 组件卸载时清理
onUnmounted(() => {
  logger.log('👋 [卸载] 清理3D效果事件监听器');
  cleanupEffects();
});

// 加载当前用户的专属数据（历史记录、收藏）
function loadUserData() {
  logger.log('📦 [用户] 加载当前用户的数据...');
  
  // 加载当前用户的收藏
  logger.log('⭐ [初始化] 加载收藏数据');
  const favoritesKey = getUserStorageKey('fortuneFavorites');
  const savedFavorites = localStorage.getItem(favoritesKey);
  if (savedFavorites) {
    favorites.value = JSON.parse(savedFavorites);
    logger.log('  - 已加载', favorites.value.length, '个收藏');
  } else {
    logger.log('  - 无收藏数据');
  }
  
  // 加载当前用户的历史记录
  logger.log('📜 [初始化] 加载历史记录');
  const historyKey = getUserStorageKey('fortuneHistory');
  const savedHistory = localStorage.getItem(historyKey);
  if (savedHistory) {
    history.value = JSON.parse(savedHistory);
    logger.log('  - 已加载', history.value.length, '条历史记录');
  } else {
    logger.log('  - 无历史记录');
  }
  
  logger.log('📦 [用户] 用户数据加载完成');
}

// 监听标签页切换
watch(activeTab, (newTab, oldTab) => {
  logger.log(`📑 [标签] 切换标签页 - 从 ${oldTab} 切换到 ${newTab}`);
  if (newTab === 'stats') {
    logger.log('📑 [标签] 切换到统计标签，开始渲染图表...');
    renderCharts();
  }
});

// 监听登录页面显示，生成验证码
watch(showLoginPage, (newVal) => {
  if (newVal) {
    logger.log('🔐 [登录页面] 显示登录页面，生成验证码');
    nextTick(() => {
      generateCaptcha();
    });
  }
});

// 监听窗口大小变化，自动重绘图表
let resizeTimer;
window.addEventListener('resize', () => {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (activeTab.value === 'stats' && history.value.length > 0) {
      renderCharts();
    }
  }, 300);
});

// 用户登录（新）
function handleAuthLogin() {
  logger.log('🔐 [登录] 开始登录流程');
  clearAllAuthErrors();
  authLoading.value = true;
  
  logger.log('📝 [登录] 输入验证 - 用户名:', loginUsername.value, '密码:', loginPassword.value ? '***' : '');
  
  setTimeout(() => {
    let hasError = false;
    
    // 字段级别验证
    if (!loginUsername.value.trim()) {
      logger.log('❌ [登录] 用户名为空');
      setFieldError('loginUsername', '请输入用户名');
      hasError = true;
    }
    
    if (!loginPassword.value) {
      logger.log('❌ [登录] 密码为空');
      setFieldError('loginPassword', '请输入密码');
      hasError = true;
    }
    
    // 验证码验证
    const captchaResult = validateCaptcha();
    if (!captchaResult.valid) {
      logger.log('❌ [登录] 验证码验证失败:', captchaResult.message);
      setFieldError('captcha', captchaResult.message);
      hasError = true;
    }
    
    if (hasError) {
      logger.log('❌ [登录] 输入验证失败');
      authError.value = '请完善登录信息';
      authLoading.value = false;
      return;
    }
    
    logger.log('📚 [登录] 从 localStorage 读取用户列表');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    logger.log('📋 [登录] 找到', users.length, '个注册用户');
    
    logger.log('🔍 [登录] 查找匹配用户');
    const user = users.find(u => u.username === loginUsername.value && u.password === loginPassword.value);
    
    if (user) {
      logger.log('✅ [登录] 用户验证成功 - 用户:', user.username);
      
      logger.log('💾 [登录] 更新应用状态');
      currentUser.value = user;
      isLoggedIn.value = true;
      logger.log('  - currentUser:', currentUser.value);
      logger.log('  - isLoggedIn:', isLoggedIn.value);
      
      logger.log('📦 [登录] 保存用户状态到 localStorage');
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      logger.log('📦 [用户] 切换用户，重新加载用户数据！');
      // 重置所有状态
      result.value = null;
      drawnTarot.value = null;
      isTarotMode.value = false; // 重置到传统模式
      name.value = '';
      birthDate.value = '';
      question.value = '';
      questionType.value = '综合';
      searchQuery.value = '';
      filterType.value = '';
      loadUserData();
      
      logger.log('🚪 [登录] 关闭登录页面');
      showLoginPage.value = false;
      
      authLoading.value = false;
      
      logger.log('🎉 [登录] 登录流程完成！');
      
      // 保存记住密码
      saveRememberedLogin();
      
      // 使用 toast 提示替代 alert
      showToast(`欢迎回来，${user.username}！`, 'success');
    } else {
      logger.log('❌ [登录] 用户验证失败 - 找不到匹配的用户');
      authError.value = '用户名或密码错误';
      authLoading.value = false;
    }
  }, 800);
}

// 用户注册（新）
function handleAuthRegister() {
  logger.log('📝 [注册] 开始注册流程');
  clearAllAuthErrors();
  authLoading.value = true;
  
  logger.log('📋 [注册] 输入验证 - 用户名:', registerUsername.value, '密码:', registerPassword.value ? '***' : '');
  
  setTimeout(() => {
    let hasError = false;
    
    // 字段级别验证
    if (!registerUsername.value.trim()) {
      logger.log('❌ [注册] 用户名为空');
      setFieldError('registerUsername', '请输入用户名');
      hasError = true;
    } else if (registerUsername.value.trim().length < 3) {
      logger.log('❌ [注册] 用户名太短');
      setFieldError('registerUsername', '用户名至少3个字符');
      hasError = true;
    }
    
    if (!registerPassword.value) {
      logger.log('❌ [注册] 密码为空');
      setFieldError('registerPassword', '请输入密码');
      hasError = true;
    } else if (registerPassword.value.length < 6) {
      logger.log('❌ [注册] 密码太短');
      setFieldError('registerPassword', '密码至少6个字符');
      hasError = true;
    }
    
    if (!registerConfirm.value) {
      logger.log('❌ [注册] 确认密码为空');
      setFieldError('registerConfirm', '请确认密码');
      hasError = true;
    } else if (registerPassword.value !== registerConfirm.value) {
      logger.log('❌ [注册] 密码验证失败 - 两次密码不一致');
      setFieldError('registerConfirm', '两次密码不一致');
      hasError = true;
    }
    
    if (hasError) {
      logger.log('❌ [注册] 输入验证失败');
      authError.value = '请完善注册信息';
      authLoading.value = false;
      return;
    }
    
    logger.log('📚 [注册] 从 localStorage 读取现有用户列表');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    logger.log('📋 [注册] 当前已有', users.length, '个用户');
    
    // 检查用户是否已存在
    logger.log('🔍 [注册] 检查用户名是否已存在');
    const userExists = users.find(u => u.username === registerUsername.value);
    if (userExists) {
      logger.log('❌ [注册] 用户名已存在');
      authError.value = '用户名已存在';
      authLoading.value = false;
      return;
    }
    
    logger.log('👤 [注册] 创建新用户');
    const newUser = {
      id: Date.now(),
      username: registerUsername.value,
      password: registerPassword.value, // 实际应用中应该加密
      createdAt: new Date().toISOString()
    };
    logger.log('  - 新用户信息:', { ...newUser, password: '***' });
    
    users.push(newUser);
    logger.log('💾 [注册] 保存用户列表到 localStorage');
    localStorage.setItem('users', JSON.stringify(users));
    
    logger.log('🔐 [注册] 自动登录');
    currentUser.value = newUser;
    isLoggedIn.value = true;
    logger.log('  - currentUser:', currentUser.value);
    logger.log('  - isLoggedIn:', isLoggedIn.value);
    
    logger.log('📦 [注册] 保存登录状态到 localStorage');
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    logger.log('📦 [用户] 新用户注册，初始化空数据！');
    // 重置所有状态
    result.value = null;
    drawnTarot.value = null;
    isTarotMode.value = false; // 重置到传统模式
    history.value = [];
    favorites.value = [];
    name.value = '';
    birthDate.value = '';
    question.value = '';
    questionType.value = '综合';
    searchQuery.value = '';
    filterType.value = '';
    
    logger.log('🚪 [注册] 关闭登录页面');
    showLoginPage.value = false;
    
    authLoading.value = false;
    
    logger.log('🎉 [注册] 注册流程完成！');
    alert(`注册成功！欢迎你，${newUser.username}！`);
  }, 800);
}

// 旧的登录函数保持兼容性
function handleLogin() {
  showLoginPage.value = true;
}

function handleRegister() {
  authMode.value = 'register';
  showLoginPage.value = true;
}

// 用户退出登录
function handleLogout() {
  logger.log('👋 [退出] 开始退出流程');
  
  logger.log('📦 [退出] 清除应用状态');
  isLoggedIn.value = false;
  currentUser.value = null;
  logger.log('  - isLoggedIn:', isLoggedIn.value);
  logger.log('  - currentUser:', currentUser.value);
  
  logger.log('🗑️ [退出] 清除当前用户数据');
  // 重置所有状态
  result.value = null;
  drawnTarot.value = null;
  isTarotMode.value = false; // 重置到传统模式
  history.value = [];
  favorites.value = [];
  name.value = '';
  birthDate.value = '';
  question.value = '';
  questionType.value = '综合';
  searchQuery.value = '';
  filterType.value = '';
  activeTab.value = 'fortune'; // 回到算命标签
  
  logger.log('🗑️ [退出] 清除 localStorage 中的用户状态');
  localStorage.removeItem('currentUser');
  
  logger.log('🔄 [退出] 显示登录页面');
  showLoginPage.value = true;
  
  logger.log('👋 [退出] 退出流程完成！');
  alert('已退出登录');
}

// === 每日运势推送功能 ===

// 请求通知权限
async function requestNotificationPermission() {
  logger.log('🔔 [推送] 请求通知权限...');
  
  if (!('Notification' in window)) {
    logger.warn('🔔 [推送] 浏览器不支持通知功能');
    alert('抱歉，您的浏览器不支持通知功能！');
    return false;
  }
  
  const permission = await Notification.requestPermission();
  logger.log(`🔔 [推送] 权限请求结果: ${permission}`);
  
  if (permission === 'granted') {
    logger.log('🔔 [推送] 通知权限获取成功');
    return true;
  } else {
    logger.warn('🔔 [推送] 通知权限被拒绝');
    alert('通知权限被拒绝！请在浏览器设置中打开通知权限。');
    return false;
  }
}

// 生成当日运势
function generateDailyFortune() {
  const fortunes = [
    '🌟 今日大吉，事业顺遂！',
    '💰 财运亨通，适合投资！',
    '💕 桃花运旺，适合表白！',
    '🎯 学业进步，考试顺利！',
    '💪 精力充沛，适合运动！',
    '🌈 心情愉快，好运连连！',
    '📚 学习运势极佳！',
    '✨ 贵人相助，把握机会！'
  ];
  
  const randomIndex = Math.floor(Math.random() * fortunes.length);
  return fortunes[randomIndex];
}

// 发送通知
function sendNotification() {
  logger.log('🔔 [推送] 准备发送每日运势通知...');
  
  if (Notification.permission !== 'granted') {
    logger.warn('🔔 [推送] 通知权限未授予，无法发送');
    return;
  }
  
  const title = '🔮 今日运势提醒';
  const body = generateDailyFortune();
  logger.log(`🔔 [推送] 通知内容: "${body}"`);
  
  const icon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMCIgZmlsbD0iI2ZmYzAwMCIvPjx0ZXh0IHg9IjMyIiB5PSI0MCIgZm9udC1zaXplPSIyNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiPvCfkqs8L3RleHQ+PC9zdmc+';
  
  const notification = new Notification(title, {
    body: body,
    icon: icon,
    tag: 'daily-fortune'
  });
  
  logger.log('🔔 [推送] 通知已发送');
  
  notification.onclick = () => {
    logger.log('🔔 [推送] 用户点击了通知');
    window.focus();
    notification.close();
  };
}

// 计算距离下次推送的时间（毫秒）
function getTimeUntilNextPush() {
  const [hours, minutes] = pushTime.value.split(':').map(Number);
  const now = new Date();
  const nextPush = new Date();
  nextPush.setHours(hours, minutes, 0, 0);
  
  // 如果今天的时间已过，则安排明天
  if (nextPush <= now) {
    nextPush.setDate(nextPush.getDate() + 1);
  }
  
  return nextPush - now;
}

// 设置推送定时器
function setupPushTimer() {
  logger.log('🔔 [推送] 设置推送定时器...');
  
  if (pushTimer.value) {
    logger.log('🔔 [推送] 清除旧的定时器');
    clearTimeout(pushTimer.value);
  }
  
  const delay = getTimeUntilNextPush();
  const minutes = Math.round(delay / 1000 / 60);
  logger.log(`🔔 [推送] 下次推送将在 ${minutes} 分钟后 (${pushTime.value})`);
  
  pushTimer.value = setTimeout(() => {
    logger.log('🔔 [推送] 定时器触发，发送通知');
    sendNotification();
    // 发送后继续设置明天的定时器
    setupPushTimer();
  }, delay);
  logger.log('🔔 [推送] 定时器设置完成');
}

// 切换推送开关
async function togglePushNotification() {
  logger.log('🔔 [推送] 切换推送开关...');
  
  if (!isPushEnabled.value) {
    logger.log('🔔 [推送] 准备开启推送');
    // 开启推送
    const hasPermission = await requestNotificationPermission();
    if (hasPermission) {
      isPushEnabled.value = true;
      localStorage.setItem('pushEnabled', 'true');
      localStorage.setItem('pushTime', pushTime.value);
      logger.log(`🔔 [推送] 推送已开启，推送时间: ${pushTime.value}`);
      setupPushTimer();
      alert('✅ 每日运势推送已开启！');
      
      // 立即发送一次测试通知
      logger.log('🔔 [推送] 发送测试通知');
      setTimeout(() => {
        sendNotification();
      }, 1000);
    } else {
      logger.warn('🔔 [推送] 开启推送失败：权限未获取');
    }
  } else {
    logger.log('🔔 [推送] 准备关闭推送');
    // 关闭推送
    isPushEnabled.value = false;
    localStorage.removeItem('pushEnabled');
    if (pushTimer.value) {
      logger.log('🔔 [推送] 清除推送定时器');
      clearTimeout(pushTimer.value);
      pushTimer.value = null;
    }
    logger.log('🔔 [推送] 推送已关闭');
    alert('❌ 每日运势推送已关闭');
  }
}

// 修改推送时间
function updatePushTime() {
  logger.log(`🔔 [推送] 修改推送时间: ${pushTime.value}`);
  localStorage.setItem('pushTime', pushTime.value);
  if (isPushEnabled.value) {
    logger.log('🔔 [推送] 重新设置推送定时器');
    setupPushTimer();
    alert(`⏰ 推送时间已更改为 ${pushTime.value}`);
  }
}

function toggleFavorite() {
  let favoriteItem;
  
  // 检查是塔罗牌结果还是传统算命结果
  if (isTarotMode.value && drawnTarot.value) {
    logger.log('⭐ [收藏] 开始收藏塔罗牌结果...');
    favoriteItem = {
      id: Date.now(),
      user_name: name.value,
      birth_date: birthDate.value,
      question_type: '塔罗牌占卜',
      zodiac_sign: null,
      chinese_zodiac: null,
      prediction: `抽到了【${drawnTarot.value.name}】牌`,
      advice: drawnTarot.value.meaning,
      isTarot: true,
      tarotName: drawnTarot.value.name,
      tarotMeaning: drawnTarot.value.meaning,
      created_at: new Date().toISOString()
    };
  } else if (result.value) {
    logger.log('⭐ [收藏] 开始切换传统算命收藏状态...');
    favoriteItem = {
      id: Date.now(),
      user_name: name.value,
      birth_date: birthDate.value,
      question_type: questionType.value,
      zodiac_sign: result.value.zodiac_sign,
      chinese_zodiac: result.value.chinese_zodiac,
      prediction: result.value.prediction,
      advice: result.value.advice,
      isTarot: false,
      created_at: new Date().toISOString()
    };
  } else {
    logger.warn('⭐ [收藏] 没有可收藏的结果');
    return;
  }
  
  logger.log(`⭐ [收藏] 收藏内容 - 用户: ${favoriteItem.user_name}, 类型: ${favoriteItem.question_type}`);
  
  // 检查是否已收藏
  const existingIndex = favorites.value.findIndex(
    f => f.prediction === favoriteItem.prediction && f.user_name === favoriteItem.user_name
  );
  
  if (existingIndex >= 0) {
    // 取消收藏
    logger.log('⭐ [收藏] 检测到已收藏，执行取消收藏...');
    favorites.value.splice(existingIndex, 1);
    logger.log('⭐ [收藏] 取消收藏成功');
  } else {
    // 添加收藏
    logger.log('⭐ [收藏] 检测到未收藏，执行添加收藏...');
    favorites.value.unshift(favoriteItem);
    logger.log('⭐ [收藏] 添加收藏成功');
  }
  
  // 保存到localStorage
  logger.log('⭐ [收藏] 开始保存收藏数据到 localStorage...');
  const favoritesKey = getUserStorageKey('fortuneFavorites');
  localStorage.setItem(favoritesKey, JSON.stringify(favorites.value));
  logger.log(`⭐ [收藏] 保存完成，当前共有 ${favorites.value.length} 个收藏`);
}

function isFavorite() {
  // 检查塔罗牌收藏
  if (isTarotMode.value && drawnTarot.value) {
    const tarotPrediction = `抽到了【${drawnTarot.value.name}】牌`;
    return favorites.value.some(
      f => f.prediction === tarotPrediction && f.user_name === name.value
    );
  }
  // 检查传统算命收藏
  if (result.value) {
    return favorites.value.some(
      f => f.prediction === result.value.prediction && f.user_name === name.value
    );
  }
  return false;
}

function toggleTheme() {
  const newTheme = !isDarkMode.value ? 'dark' : 'light';
  const oldTheme = isDarkMode.value ? 'dark' : 'light';
  logger.log(`🎨 [主题] 切换主题 - 从 ${oldTheme} 切换到 ${newTheme}`);
  
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
  logger.log('🎨 [主题] 主题切换完成并保存到 localStorage');
}

async function loadHistoryFromServer() {
  logger.log('📜 [历史] 开始从服务器加载历史记录...');
  try {
    const params = new URLSearchParams();
    const username = currentUser.value?.username;
    if (username) {
      params.append('user_name', username);
      logger.log(`📜 [历史] 加载用户 ${username} 的历史记录`);
    } else {
      logger.log('📜 [历史] 加载所有历史记录');
    }
    
    const response = await fetch(`https://fortune-telling-app-production.up.railway.app/api/history?${params.toString()}`);
    if (response.ok) {
      history.value = await response.json();
      logger.log(`📜 [历史] 从服务器成功加载 ${history.value.length} 条记录`);
    }
  } catch (error) {
    logger.error('📜 [历史] 加载历史记录失败:', error);
    logger.log('📜 [历史] 降级到 localStorage...');
    const historyKey = getUserStorageKey('fortuneHistory');
    const savedHistory = localStorage.getItem(historyKey);
    if (savedHistory) {
      history.value = JSON.parse(savedHistory);
      logger.log(`📜 [历史] 从 localStorage 成功加载 ${history.value.length} 条记录`);
    } else {
      logger.log('📜 [历史] localStorage 中没有历史记录');
    }
  }
}

function saveToHistory(item) {
  logger.log('📜 [历史] 保存算命结果到历史...');
  logger.log(`📜 [历史] 历史内容: ${JSON.stringify({ user: item.user_name, type: item.question_type })}`);
  
  // 保存到内存中用于显示
  history.value.unshift(item);
  if (history.value.length > 20) {
    logger.log('📜 [历史] 历史记录超过20条，进行截断');
    history.value = history.value.slice(0, 20);
  }
  // 同时保存到localStorage作为备份
  logger.log(`📜 [历史] 保存到 localStorage，当前 ${history.value.length} 条记录`);
  const historyKey = getUserStorageKey('fortuneHistory');
  localStorage.setItem(historyKey, JSON.stringify(history.value.slice(0, 10)));
}

function getZodiacSign(dateString) {
  const date = new Date(dateString);
  const month = date.getMonth();
  const day = date.getDate();
  
  for (let i = 0; i < zodiacSigns.length; i++) {
    const current = zodiacSigns[i];
    const startMonth = current.start.month - 1;
    const endMonth = current.end.month - 1;
    
    if (startMonth <= endMonth) {
      if ((month > startMonth || (month === startMonth && day >= current.start.day)) &&
          (month < endMonth || (month === endMonth && day <= current.end.day))) {
        return current.sign;
      }
    } else {
      if ((month > startMonth || (month === startMonth && day >= current.start.day)) ||
          (month < endMonth || (month === endMonth && day <= current.end.day))) {
        return current.sign;
      }
    }
  }
  
  return '摩羯座';
}

function getElementColor() {
  return elementColors[questionType.value] || elementColors['综合'];
}

async function getFortune() {
  logger.log('🔮 [算命] 开始传统算命流程...');
  
  if (!name.value || !birthDate.value) {
    logger.warn('🔮 [算命] 验证失败：姓名或出生日期未填写');
    error.value = '请填写姓名和出生日期';
    return;
  }
  
  if (questionType.value === '综合' && !question.value) {
    logger.warn('🔮 [算命] 验证失败：综合类型需要具体问题');
    error.value = '请填写具体问题';
    return;
  }
  
  logger.log('🔮 [算命] 验证通过，开始请求...');
  await getFortuneFromData(name.value, birthDate.value, questionType.value, question.value);
}

async function getFortuneFromData(userName, userBirthDate, userQuestionType, userQuestion) {
  logger.log('🔮 [算命] 传统算命请求初始化...');
  logger.log(`🔮 [算命] 参数: ${JSON.stringify({ name: userName, birthDate: userBirthDate, questionType: userQuestionType, question: userQuestion?.substring(0, 50) })}`);
  
  error.value = '';
  loading.value = true;
  name.value = userName;
  birthDate.value = userBirthDate;
  questionType.value = userQuestionType;
  question.value = userQuestion || '';
  
  try {
    logger.log('🔮 [算命] 发送请求到后端...');
    const response = await fetch('https://fortune-telling-app-production.up.railway.app/api/fortune', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name.value,
        birth_date: birthDate.value,
        question: questionType.value !== '综合' ? questionType.value : question.value
      })
    });
    
    logger.log(`🔮 [算命] 收到响应，状态码: ${response.status}`);
    
    if (!response.ok) {
      throw new Error('请求失败');
    }
    
    const data = await response.json();
    logger.log('🔮 [算命] 成功获取算命结果');
    result.value = data;
    
    // 更新当前用户姓名
    currentUserName.value = name.value;
    
    // 重新从服务器加载历史记录
    logger.log('🔮 [算命] 重新加载历史记录...');
    await loadHistoryFromServer();
    
  } catch (err) {
    error.value = '获取结果失败，请稍后重试';
    logger.error('🔮 [算命] 请求失败:', err);
  } finally {
    loading.value = false;
    logger.log('🔮 [算命] 请求流程结束');
  }
}

// 处理来自新组件的事件
async function handleGetFortune(data) {
  logger.log('📨 [组件事件] 收到 FortuneForm 组件的 get-fortune 事件');
  logger.log('📨 [组件事件] 数据:', data);
  await getFortuneFromData(data.name, data.birthDate, data.questionType, data.question);
}

// 处理模式切换
function handleChangeMode(isTarot) {
  logger.log('📨 [组件事件] 收到 FortuneForm 组件的 change-mode 事件');
  logger.log(`📨 [组件事件] 新的模式：${isTarot ? '塔罗牌' : '传统算命'}`);
  isTarotMode.value = isTarot;
}

async function handleDrawTarot(data) {
  console.log('=== 🔔 App.vue: handleDrawTarot 被调用了！ ===');
  
  try {
    logger.log('📨 [组件事件] 收到 FortuneForm 组件的 draw-tarot 事件');
    logger.log('📨 [组件事件] 数据:', data);
    
    // 检查数据
    console.log('=== 🔔 检查数据：', data);
    if (!data) {
      logger.error('📨 [组件事件] 数据为空！');
      throw new Error('数据为空');
    }
    
    console.log('=== 🔔 准备调用 drawTarotFromData ===');
    await drawTarotFromData(data.name, data.birthDate, data.question);
    console.log('=== 🔔 drawTarotFromData 调用完成！ ===');
    
  } catch (error) {
    console.error('=== 🔴 handleDrawTarot 出错了！ ===', error);
    logger.error('📨 [组件事件] 处理 draw-tarot 事件出错！', error);
    alert(`处理塔罗牌占卜出错了：${error.message}`);
  }
}

// 八字算命处理
async function handleGetBazi(data) {
  logger.log('🎯 [组件事件] 收到 FortuneForm 组件的 get-bazi 事件');
  logger.log('🎯 [组件事件] 数据:', data);
  await getBaziFromData(data.name, data.birthDate, data.birthTime, data.questionType);
}

async function getBaziFromData(userName, userBirthDate, userBirthTime, userQuestionType) {
  logger.log('🎯 [八字] 八字算命请求初始化...');
  logger.log(`🎯 [八字] 参数: ${JSON.stringify({ name: userName, birthDate: userBirthDate, birthTime: userBirthTime, questionType: userQuestionType })}`);
  
  error.value = '';
  loading.value = true;
  name.value = userName;
  birthDate.value = userBirthDate;
  questionType.value = `八字-${userQuestionType}`;
  
  try {
    logger.log('🎯 [八字] 发送请求到后端...');
    const response = await fetch('https://fortune-telling-app-production.up.railway.app/api/bazi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: userName,
        birth_date: userBirthDate,
        birth_time: userBirthTime,
        question_type: userQuestionType
      })
    });
    
    logger.log(`🎯 [八字] 收到响应，状态码: ${response.status}`);
    
    if (!response.ok) {
      throw new Error('请求失败');
    }
    
    const data = await response.json();
    logger.log('🎯 [八字] 成功获取八字命书');
    
    // 格式化八字结果显示
    result.value = {
      prediction: data.title,
      advice: data.content,
      zodiac_sign: `年柱:${data.bazi_info.year_pillar} 月柱:${data.bazi_info.month_pillar}`,
      chinese_zodiac: `日柱:${data.bazi_info.day_pillar} 时柱:${data.bazi_info.hour_pillar}`,
      record_id: data.record_id,
      isBazi: true,
      baziInfo: data.bazi_info
    };
    
    // 更新当前用户姓名
    currentUserName.value = userName;
    
    // 重新从服务器加载历史记录
    logger.log('🎯 [八字] 重新加载历史记录...');
    await loadHistoryFromServer();
    
  } catch (err) {
    error.value = '获取八字结果失败，请稍后重试';
    logger.error('🎯 [八字] 请求失败:', err);
  } finally {
    loading.value = false;
    logger.log('🎯 [八字] 请求流程结束');
  }
}

// 紫微斗数处理
async function handleGetZiwei(data) {
  logger.log('⭐ [组件事件] 收到 FortuneForm 组件的 get-ziwei 事件');
  logger.log('⭐ [组件事件] 数据:', data);
  await getZiweiFromData(data.name, data.birthDate, data.birthTime, data.gender, data.questionType);
}

// 生肖运势处理
async function handleGetShengxiao(data) {
  logger.log('🐲 [组件事件] 收到 FortuneForm 组件的 get-shengxiao 事件');
  logger.log('🐲 [组件事件] 数据:', data);
  await getShengxiaoFromData(data.name, data.birthDate, data.questionType);
}

async function getShengxiaoFromData(userName, userBirthDate, userQuestionType) {
  logger.log('🐲 [生肖] 生肖运势请求初始化...');
  logger.log(`🐲 [生肖] 参数: ${JSON.stringify({ name: userName, birthDate: userBirthDate, questionType: userQuestionType })}`);

  error.value = '';
  loading.value = true;
  name.value = userName;
  birthDate.value = userBirthDate;
  questionType.value = `生肖-${userQuestionType}`;

  try {
    logger.log('🐲 [生肖] 使用前端模拟数据生成生肖运势...');
    
    // 根据出生日期计算生肖
    const birthYear = new Date(userBirthDate).getFullYear();
    const shengxiaoList = ['猴', '鸡', '狗', '猪', '鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊'];
    const shengxiao = shengxiaoList[birthYear % 12];
    
    // 生成模拟数据
    const fortuneIndex = Math.floor(Math.random() * 30) + 70; // 70-100
    const shengxiaoFortunes = {
      '年度运势': `${shengxiao}年生肖的朋友，今年整体运势稳中有升。事业上会有新的机遇，建议把握时机，勇于尝试。财运方面需要谨慎理财，避免冲动消费。感情生活较为平稳，单身者有望遇到心仪对象。`,
      '财运': `今年${shengxiao}生肖的财运呈现先抑后扬的趋势。上半年宜保守理财，下半年可适当投资。注意开源节流，避免不必要的开支。偏财运一般，不宜参与高风险投资。`,
      '感情': `${shengxiao}年生肖在感情方面今年桃花运较旺。单身者有机会通过朋友介绍认识合适的对象，已婚者要注意维护感情，多沟通交流。建议多参加社交活动，扩大交际圈。`,
      '事业': `今年${shengxiao}生肖的事业运势较为顺遂。工作中会得到贵人相助，有机会获得晋升或加薪。建议保持积极的工作态度，主动承担责任。创业者要谨慎决策，稳扎稳打。`,
      '健康': `${shengxiao}年生肖今年健康运势总体良好，但要注意劳逸结合。建议保持规律的作息时间，适当运动锻炼。饮食方面要注意营养均衡，避免暴饮暴食。定期体检，预防胜于治疗。`,
      '贵人运': `今年${shengxiao}生肖的贵人运较旺，会在关键时刻得到他人的帮助。建议多结交良师益友，保持良好的人际关系。在工作中要虚心请教，在生活中要乐于助人，善缘会带来好运。`
    };
    
    const content = shengxiaoFortunes[userQuestionType] || shengxiaoFortunes['年度运势'];
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 格式化生肖运势结果显示
    result.value = {
      prediction: `【${shengxiao}】${userQuestionType}分析`,
      advice: content,
      zodiac_sign: shengxiao,
      chinese_zodiac: `运势指数: ${fortuneIndex}/100`,
      record_id: Date.now(),
      isShengxiao: true,
      shengxiao: shengxiao,
      fortuneIndex: fortuneIndex
    };

    // 更新当前用户姓名
    currentUserName.value = userName;
    
    // 保存到历史记录
    saveFortuneRecord({
      user_name: userName,
      question_type: `生肖-${userQuestionType}`,
      zodiac_sign: shengxiao,
      chinese_zodiac: `运势指数: ${fortuneIndex}/100`,
      prediction: result.value.prediction,
      advice: content
    });

    logger.log('🐲 [生肖] 成功生成生肖运势');

  } catch (err) {
    error.value = '获取生肖运势失败，请稍后重试';
    logger.error('🐲 [生肖] 生成失败:', err);
  } finally {
    loading.value = false;
    logger.log('🐲 [生肖] 请求流程结束');
  }
}

// 星座运势处理
async function handleGetXingzuo(data) {
  logger.log('♈ [组件事件] 收到 FortuneForm 组件的 get-xingzuo 事件');
  logger.log('♈ [组件事件] 数据:', data);
  await getXingzuoFromData(data.name, data.birthDate, data.questionType);
}

async function getXingzuoFromData(userName, userBirthDate, userQuestionType) {
  logger.log('♈ [星座] 星座运势请求初始化...');
  logger.log(`♈ [星座] 参数: ${JSON.stringify({ name: userName, birthDate: userBirthDate, questionType: userQuestionType })}`);

  error.value = '';
  loading.value = true;
  name.value = userName;
  birthDate.value = userBirthDate;
  questionType.value = `星座-${userQuestionType}`;

  try {
    logger.log('♈ [星座] 使用前端模拟数据生成星座运势...');
    
    // 根据出生日期计算星座
    const date = new Date(userBirthDate);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const zodiacSigns = [
      { name: '摩羯座', start: [1, 1], end: [1, 19] },
      { name: '水瓶座', start: [1, 20], end: [2, 18] },
      { name: '双鱼座', start: [2, 19], end: [3, 20] },
      { name: '白羊座', start: [3, 21], end: [4, 19] },
      { name: '金牛座', start: [4, 20], end: [5, 20] },
      { name: '双子座', start: [5, 21], end: [6, 21] },
      { name: '巨蟹座', start: [6, 22], end: [7, 22] },
      { name: '狮子座', start: [7, 23], end: [8, 22] },
      { name: '处女座', start: [8, 23], end: [9, 22] },
      { name: '天秤座', start: [9, 23], end: [10, 23] },
      { name: '天蝎座', start: [10, 24], end: [11, 22] },
      { name: '射手座', start: [11, 23], end: [12, 21] },
      { name: '摩羯座', start: [12, 22], end: [12, 31] }
    ];
    
    const xingzuo = zodiacSigns.find(z => {
      if (month === z.start[0] && day >= z.start[1]) return true;
      if (month === z.end[0] && day <= z.end[1]) return true;
      return false;
    })?.name || '摩羯座';
    
    // 生成模拟数据
    const luckyIndex = Math.floor(Math.random() * 30) + 70;
    const luckyColors = ['红色', '蓝色', '绿色', '紫色', '金色', '粉色', '白色', '黑色'];
    const luckyColor = luckyColors[Math.floor(Math.random() * luckyColors.length)];
    const luckyNumber = Math.floor(Math.random() * 9) + 1;
    
    const xingzuoFortunes = {
      '今日运势': `今日${xingzuo}整体运势不错，适合处理重要事务。工作上可能会有新的灵感，建议及时记录下来。人际关系方面较为和谐，适合与朋友聚会交流。`,
      '本周运势': `本周${xingzuo}运势呈现上升趋势。周初可能会遇到一些小挑战，但周末会有好消息传来。工作上要保持耐心，不要急于求成。感情方面需要多关心对方。`,
      '本月运势': `${xingzuo}本月运势总体向好。事业上有机会展现自己的才能，财运方面会有意外收获。健康方面要注意休息，避免过度劳累。建议多参加户外活动，放松身心。`,
      '年度运势': `${xingzuo}今年整体运势较为平稳，是积累实力的一年。事业上会有新的发展机会，财运呈现稳步增长趋势。感情方面可能会有新的突破，单身者有望脱单。健康方面要注意饮食均衡。`,
      '爱情': `${xingzuo}在感情方面今年桃花运较旺。单身者有机会遇到心仪的对象，建议主动出击。已有伴侣者感情稳定，适合计划未来。要注意沟通方式，避免因小事产生误会。`,
      '事业': `${xingzuo}今年事业运势较为顺遂。工作中会得到上司的认可，有机会承担更重要的项目。建议保持积极的工作态度，不断提升自己的专业能力。创业者要谨慎决策，稳扎稳打。`
    };
    
    const content = xingzuoFortunes[userQuestionType] || xingzuoFortunes['今日运势'];
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 格式化星座运势结果显示
    result.value = {
      prediction: `【${xingzuo}】${userQuestionType}`,
      advice: content,
      zodiac_sign: xingzuo,
      chinese_zodiac: `幸运指数: ${luckyIndex}/100`,
      record_id: Date.now(),
      isXingzuo: true,
      xingzuo: xingzuo,
      luckyIndex: luckyIndex,
      luckyColor: luckyColor,
      luckyNumber: luckyNumber
    };

    // 更新当前用户姓名
    currentUserName.value = userName;
    
    // 保存到历史记录
    saveFortuneRecord({
      user_name: userName,
      question_type: `星座-${userQuestionType}`,
      zodiac_sign: xingzuo,
      chinese_zodiac: `幸运指数: ${luckyIndex}/100`,
      prediction: result.value.prediction,
      advice: content
    });

    logger.log('♈ [星座] 成功生成星座运势');

  } catch (err) {
    error.value = '获取星座运势失败，请稍后重试';
    logger.error('♈ [星座] 生成失败:', err);
  } finally {
    loading.value = false;
    logger.log('♈ [星座] 请求流程结束');
  }
}

// 姓名学处理
async function handleGetXingming(data) {
  logger.log('📝 [组件事件] 收到 FortuneForm 组件的 get-xingming 事件');
  logger.log('📝 [组件事件] 数据:', data);
  await getXingmingFromData(data.name, data.birthDate, data.questionType);
}

async function getXingmingFromData(userName, userBirthDate, userQuestionType) {
  logger.log('📝 [姓名] 姓名学分析请求初始化...');
  logger.log(`📝 [姓名] 参数: ${JSON.stringify({ name: userName, birthDate: userBirthDate, questionType: userQuestionType })}`);

  error.value = '';
  loading.value = true;
  name.value = userName;
  birthDate.value = userBirthDate;
  questionType.value = `姓名-${userQuestionType}`;

  try {
    logger.log('📝 [姓名] 使用前端模拟数据生成姓名学分析...');
    
    // 计算姓名笔画（简化版）
    const calculateStrokes = (char) => {
      // 简化的笔画计算，实际应该使用完整的康熙字典笔画表
      const strokeMap = {
        '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
        '王': 4, '李': 7, '张': 7, '刘': 6, '陈': 7, '杨': 7, '黄': 11, '赵': 9, '吴': 7, '周': 8,
        '徐': 10, '孙': 6, '马': 3, '朱': 6, '胡': 9, '郭': 10, '何': 7, '高': 10, '林': 8, '罗': 8
      };
      return strokeMap[char] || Math.floor(Math.random() * 10) + 1;
    };
    
    const chars = userName.split('');
    const strokes = chars.map(calculateStrokes);
    
    // 计算五格
    const tianGe = strokes[0] + 1; // 天格 = 姓氏笔画 + 1
    const renGe = strokes[0] + (strokes[1] || 0); // 人格 = 姓 + 名第一字
    const diGe = (strokes[1] || 0) + (strokes[2] || 0); // 地格 = 名字笔画总和
    const waiGe = tianGe + diGe - renGe; // 外格 = 天格 + 地格 - 人格
    const zongGe = strokes.reduce((a, b) => a + b, 0); // 总格 = 姓名总笔画
    
    // 五行属性
    const wuxingList = ['金', '木', '水', '火', '土'];
    const wuxing = wuxingList[zongGe % 5];
    
    // 五格评分
    const wugeScore = Math.min(95, Math.max(70, 75 + (zongGe % 20)));
    
    // 根据分析类型生成内容
    const xingmingAnalysis = {
      '五格分析': `根据姓名学五格剖象法分析，您的姓名五格配置如下：天格${tianGe}、人格${renGe}、地格${diGe}、外格${waiGe}、总格${zongGe}。总格${zongGe}数暗示着您具有坚韧不拔的性格，做事有条理，能够坚持到底。五格配置整体较为和谐，有利于事业发展和人际关系。`,
      '性格分析': `从姓名笔画分析，您的性格特点是：做事认真负责，有较强的责任心和使命感。为人诚实守信，重视承诺。思维缜密，善于分析问题。有时会过于追求完美，给自己带来压力。建议适当放松心态，学会享受生活的乐趣。`,
      '事业运': `姓名显示您的事业运势较为顺遂。适合从事需要耐心和细心的工作，如管理、策划、教育等领域。工作中会得到贵人相助，有机会获得晋升。建议保持积极的工作态度，不断提升专业能力。创业方面要谨慎决策，稳扎稳打。`,
      '财运': `从姓名分析，您的财运呈现稳中有升的趋势。正财收入稳定，偏财方面需要谨慎。理财方面建议采取稳健策略，避免高风险投资。适合从事与金融、管理相关的工作。注意开源节流，合理规划财务。`,
      '健康运': `姓名显示您的健康状况总体良好，但要注意劳逸结合。容易出现因工作压力大而导致的身体不适。建议保持规律的作息时间，适当运动锻炼。饮食方面要注意营养均衡，避免暴饮暴食。定期体检，预防胜于治疗。`,
      '人际关系': `从姓名分析，您在人际关系方面较为顺利。为人真诚友善，容易获得他人的信任。适合建立长期的合作关系。建议多参加社交活动，扩大交际圈。在人际交往中要保持真诚，避免过于功利。良缘会为您带来好运。`
    };
    
    const content = xingmingAnalysis[userQuestionType] || xingmingAnalysis['五格分析'];
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 格式化姓名学结果显示
    result.value = {
      prediction: `【${userName}】${userQuestionType}`,
      advice: content,
      zodiac_sign: `五格评分: ${wugeScore}/100`,
      chinese_zodiac: `五行属性: ${wuxing}`,
      record_id: Date.now(),
      isXingming: true,
      wugeScore: wugeScore,
      wuxing: wuxing,
      tianGe: tianGe,
      diGe: diGe,
      renGe: renGe,
      waiGe: waiGe,
      zongGe: zongGe
    };

    // 更新当前用户姓名
    currentUserName.value = userName;
    
    // 保存到历史记录
    saveFortuneRecord({
      user_name: userName,
      question_type: `姓名-${userQuestionType}`,
      zodiac_sign: `五格评分: ${wugeScore}/100`,
      chinese_zodiac: `五行属性: ${wuxing}`,
      prediction: result.value.prediction,
      advice: content
    });
    
    logger.log('📝 [姓名] 成功生成姓名学分析');

  } catch (err) {
    error.value = '获取姓名学分析失败，请稍后重试';
    logger.error('📝 [姓名] 请求失败:', err);
  } finally {
    loading.value = false;
    logger.log('📝 [姓名] 请求流程结束');
  }
}

// 周公解梦处理
async function handleGetJiemeng(data) {
  logger.log('💭 [组件事件] 收到 FortuneForm 组件的 get-jiemeng 事件');
  logger.log('💭 [组件事件] 数据:', data);
  await getJiemengFromData(data.name, data.dream, data.questionType);
}

async function getJiemengFromData(userName, userDream, userQuestionType) {
  logger.log('💭 [解梦] 周公解梦分析请求初始化...');
  logger.log(`💭 [解梦] 参数: ${JSON.stringify({ name: userName, dreamType: userQuestionType })}`);

  error.value = '';
  loading.value = true;
  name.value = userName;
  question.value = userDream;
  questionType.value = `解梦-${userQuestionType}`;

  try {
    logger.log('💭 [解梦] 使用前端模拟数据生成解梦结果...');
    
    // 分析梦境关键词
    const dreamKeywords = {
      '水': '财运',
      '火': '热情',
      '山': '事业',
      '海': '机遇',
      '飞': '自由',
      '跑': '压力',
      '钱': '财富',
      '人': '人际',
      '家': '家庭',
      '车': '前进',
      '考试': '压力',
      '结婚': '承诺',
      '死亡': '转变',
      '孩子': '新生',
      '动物': '本能',
      '掉牙': '焦虑',
      '追赶': '逃避',
      '坠落': '失控',
      '飞翔': '自由',
      '迷路': '迷茫'
    };
    
    // 查找梦境中的关键词
    const foundKeywords = Object.keys(dreamKeywords).filter(keyword => 
      userDream.includes(keyword)
    );
    
    // 生成吉凶指数
    const luckIndex = Math.floor(Math.random() * 40) + 60; // 60-100
    const isGood = luckIndex >= 70;
    
    // 根据梦境类型和关键词生成解读
    const jiemengInterpretations = {
      '情感类': {
        good: '这个梦境预示着您的感情生活将迎来积极的变化。梦中的意象显示您内心渴望更深层次的情感连接。建议您敞开心扉，主动表达自己的感受。单身者有望遇到心仪对象，已有伴侣者感情会更加稳固。',
        bad: '这个梦境反映了您在情感方面的一些担忧和不安。可能是近期感情生活中遇到了一些小波折。建议您冷静思考，与伴侣多沟通交流，共同解决问题。不要过度解读梦境，保持平和的心态。'
      },
      '事业类': {
        good: '这个梦境预示着您的事业将会有所突破。梦中的意象象征着机遇和成功。建议您把握当前的机会，勇于接受新的挑战。工作中会得到贵人相助，努力将会得到回报。保持积极的工作态度。',
        bad: '这个梦境反映了您对工作压力的一些担忧。可能是近期工作任务较重，让您感到疲惫。建议您适当调整工作节奏，学会 delegation。不要给自己太大压力，适当休息才能走得更远。'
      },
      '财运类': {
        good: '这个梦境预示着财运亨通，可能会有意外之财。梦中的意象象征着财富和丰收。建议您把握机会，但也要注意理性投资。正财稳定，偏财可期。注意开源节流，合理规划财务。',
        bad: '这个梦境提醒您要注意财务管理，避免不必要的开支。可能是近期消费较多，让您产生了一些担忧。建议您制定合理的预算计划，避免冲动消费。谨慎投资，稳扎稳打才是长久之计。'
      },
      '健康类': {
        good: '这个梦境预示着您的身体状况良好，精力充沛。梦中的意象象征着活力和健康。建议您保持良好的生活习惯，适当运动锻炼。定期体检，预防胜于治疗。保持乐观的心态对健康有益。',
        bad: '这个梦境提醒您要关注自己的健康状况。可能是近期工作压力较大，身体有些疲劳。建议您调整作息时间，保证充足的睡眠。适当放松心情，必要时可以做个体检。健康是最重要的财富。'
      },
      '人际关系': {
        good: '这个梦境预示着您的人际关系将会有所改善。梦中的意象象征着和谐与友谊。建议您多参加社交活动，扩大交际圈。真诚待人，会收获真挚的友谊。贵人运较旺，会在关键时刻得到帮助。',
        bad: '这个梦境反映了您在人际交往中的一些困扰。可能是近期与他人产生了一些误会。建议您主动沟通，化解矛盾。保持宽容的心态，学会换位思考。良好的人际关系需要双方共同维护。'
      },
      '其他': {
        good: '这个梦境整体来说是吉兆，预示着近期运势向好。梦中的意象显示您的潜意识正在积极处理生活中的各种信息。建议您保持乐观的心态，相信一切都会向好的方向发展。',
        bad: '这个梦境可能反映了您潜意识中的一些担忧。不过不必过于担心，梦境只是潜意识的表达，不代表现实。建议您放松心情，适当减压。保持积极的生活态度，困难总会过去。'
      }
    };
    
    const interpretationType = jiemengInterpretations[userQuestionType] || jiemengInterpretations['其他'];
    const interpretation = isGood ? interpretationType.good : interpretationType.bad;
    
    // 提取梦境摘要（前20字）
    const dreamSummary = userDream.substring(0, 20) + (userDream.length > 20 ? '...' : '');
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 格式化解梦结果显示
    result.value = {
      prediction: `【${userQuestionType}】${dreamSummary}`,
      advice: interpretation,
      zodiac_sign: `梦境类型: ${userQuestionType}`,
      chinese_zodiac: `吉凶指数: ${luckIndex}/100`,
      record_id: Date.now(),
      isJiemeng: true,
      dreamType: userQuestionType,
      luckIndex: luckIndex,
      interpretation: interpretation
    };

    // 更新当前用户姓名
    currentUserName.value = userName;
    
    // 保存到历史记录
    saveFortuneRecord({
      user_name: userName,
      question_type: `解梦-${userQuestionType}`,
      zodiac_sign: `梦境类型: ${userQuestionType}`,
      chinese_zodiac: `吉凶指数: ${luckIndex}/100`,
      prediction: result.value.prediction,
      advice: interpretation
    });
    
    logger.log('💭 [解梦] 成功生成解梦结果');

  } catch (err) {
    error.value = '获取解梦结果失败，请稍后重试';
    logger.error('💭 [解梦] 请求失败:', err);
  } finally {
    loading.value = false;
    logger.log('💭 [解梦] 请求流程结束');
  }
}

async function getZiweiFromData(userName, userBirthDate, userBirthTime, userGender, userQuestionType) {
  logger.log('⭐ [紫微] 紫微斗数请求初始化...');
  logger.log(`⭐ [紫微] 参数: ${JSON.stringify({ name: userName, birthDate: userBirthDate, birthTime: userBirthTime, gender: userGender, questionType: userQuestionType })}`);
  
  error.value = '';
  loading.value = true;
  name.value = userName;
  birthDate.value = userBirthDate;
  questionType.value = `紫微-${userQuestionType}`;
  
  try {
    logger.log('⭐ [紫微] 发送请求到后端...');
    const response = await fetch('https://fortune-telling-app-production.up.railway.app/api/ziwei', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: userName,
        birth_date: userBirthDate,
        birth_time: userBirthTime,
        gender: userGender,
        question_type: userQuestionType
      })
    });
    
    logger.log(`⭐ [紫微] 收到响应，状态码: ${response.status}`);
    
    if (!response.ok) {
      throw new Error('请求失败');
    }
    
    const data = await response.json();
    logger.log('⭐ [紫微] 成功获取紫微命书');
    
    // 格式化紫微结果显示
    result.value = {
      prediction: data.title,
      advice: data.content,
      zodiac_sign: `命宫:${data.ming_gong}`,
      chinese_zodiac: `五行局:${data.wu_xing_ju}`,
      record_id: data.record_id,
      isZiwei: true,
      mingGong: data.ming_gong,
      wuXingJu: data.wu_xing_ju
    };
    
    // 更新当前用户姓名
    currentUserName.value = userName;
    
    // 重新从服务器加载历史记录
    logger.log('⭐ [紫微] 重新加载历史记录...');
    await loadHistoryFromServer();
    
  } catch (err) {
    error.value = '获取紫微斗数结果失败，请稍后重试';
    logger.error('⭐ [紫微] 请求失败:', err);
  } finally {
    loading.value = false;
    logger.log('⭐ [紫微] 请求流程结束');
  }
}

function resetForm() {
  logger.log('🔄 [表单] 重置表单...');
  name.value = '';
  birthDate.value = '';
  question.value = '';
  questionType.value = '综合';
  result.value = null;
  error.value = '';
  logger.log('🔄 [表单] 表单已重置');
}

async function deleteHistory(itemId) {
  logger.log('🗑️ [历史] 删除单条历史记录...');
  logger.log(`🗑️ [历史] 记录ID: ${itemId}`);
  
  try {
    logger.log('🗑️ [历史] 发送删除请求到后端...');
    const response = await fetch('https://fortune-telling-app-production.up.railway.app/api/history/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: itemId })
    });
    
    logger.log(`🗑️ [历史] 删除响应状态码: ${response.status}`);
    
    if (response.ok) {
      logger.log('🗑️ [历史] 删除成功，重新加载历史记录');
      // 重新从服务器加载历史记录
      await loadHistoryFromServer();
    } else {
      logger.warn('🗑️ [历史] 后端删除失败，降级到本地删除');
      // 如果API失败，至少从本地删除
      history.value = history.value.filter(item => item.id !== itemId);
      const historyKey = getUserStorageKey('fortuneHistory');
      localStorage.setItem(historyKey, JSON.stringify(history.value));
    }
  } catch (error) {
    logger.error('🗑️ [历史] 删除历史记录失败:', error);
    logger.log('🗑️ [历史] 降级到本地删除');
    // 降级到本地删除
    history.value = history.value.filter(item => item.id !== itemId);
    const historyKey = getUserStorageKey('fortuneHistory');
    localStorage.setItem(historyKey, JSON.stringify(history.value));
  }
  logger.log('🗑️ [历史] 删除流程完成');
}

async function clearHistory() {
  logger.log('🗑️ [历史] 开始清空所有历史记录...');
  logger.log(`🗑️ [历史] 当前共有 ${history.value.length} 条记录需要删除`);
  
  // 逐个删除所有历史记录
  let deletedCount = 0;
  for (const item of [...history.value]) {
    if (item.id) {
      await deleteHistory(item.id);
      deletedCount++;
    }
  }
  
  history.value = [];
  const historyKey = getUserStorageKey('fortuneHistory');
  localStorage.removeItem(historyKey);
  logger.log(`🗑️ [历史] 成功删除 ${deletedCount} 条记录，历史已清空`);
}

// 清空收藏
function clearFavorites() {
  logger.log('🗑️ [收藏] 开始清空收藏...');
  logger.log(`🗑️ [收藏] 当前共有 ${favorites.value.length} 条收藏`);
  
  favorites.value = [];
  const favoritesKey = getUserStorageKey('fortuneFavorites');
  localStorage.removeItem(favoritesKey);
  
  logger.log('🗑️ [收藏] 收藏已清空');
}

// 移除单个收藏
function removeFavorite(itemId) {
  logger.log('🗑️ [收藏] 移除单个收藏...');
  logger.log(`🗑️ [收藏] 记录ID: ${itemId}`);
  
  favorites.value = favorites.value.filter(f => f.id !== itemId);
  const favoritesKey = getUserStorageKey('fortuneFavorites');
  localStorage.setItem(favoritesKey, JSON.stringify(favorites.value));
  
  logger.log('🗑️ [收藏] 单个收藏已移除');
}

// 清除筛选
function clearFilter() {
  logger.log('🔍 [筛选] 清除搜索和筛选条件...');
  searchQuery.value = '';
  filterType.value = '';
  logger.log('🔍 [筛选] 筛选已清除');
}

function viewFromHistory(item) {
  logger.log('👁️ [历史] 查看历史记录...');
  logger.log(`👁️ [历史] 记录详情 - 用户: ${item.user_name}, 类型: ${item.question_type}, 记录ID: ${item.id}`);
  
  name.value = item.user_name;
  birthDate.value = item.birth_date;
  
  // 检查是否是塔罗牌记录
  if (item.isTarot || item.question_type === '塔罗牌占卜') {
    logger.log('👁️ [历史] 是塔罗牌占卜记录');
    isTarotMode.value = true;
    result.value = null; // 清空传统算命结果
    // 重新构建塔罗牌对象
    drawnTarot.value = {
      name: item.tarotName || item.prediction.replace('抽到了【', '').replace('】牌', ''),
      meaning: item.tarotMeaning || item.advice
    };
  } else {
    logger.log('👁️ [历史] 是传统算命记录');
    isTarotMode.value = false;
    drawnTarot.value = null; // 清空塔罗牌结果
    question.value = item.question_type;
    questionType.value = item.question_type;
    result.value = {
      prediction: item.prediction,
      advice: item.advice,
      zodiac_sign: item.zodiac_sign,
      chinese_zodiac: item.chinese_zodiac,
      record_id: item.id
    };
  }
  
  activeTab.value = 'fortune';
  logger.log('👁️ [历史] 已切换到算命标签页并显示结果');
}

function shareResult() {
  if (!result.value && !drawnTarot.value) {
    logger.warn('📤 [分享] 没有可分享的结果');
    return;
  }
  
  logger.log('📤 [分享] 开始分享操作...');
  
  let text;
  if (isTarotMode.value && drawnTarot.value) {
    text = `${name.value}的塔罗牌占卜：\n抽到了【${drawnTarot.value.name}】\n含义：${drawnTarot.value.meaning}\n\n#塔罗牌占卜 #运势 #算命`;
  } else {
    text = `${name.value}的${questionType.value}运势：\n预测：${result.value.prediction}\n建议：${result.value.advice}\n\n#${questionType.value} #运势 #算命`;
  }
  
  if (navigator.share) {
    logger.log('📤 [分享] 使用系统分享功能');
    navigator.share({
      title: '算命结果',
      text: text,
    }).then(() => {
      logger.log('📤 [分享] 系统分享成功');
    }).catch(err => logger.error('📤 [分享] 分享失败:', err));
  } else {
    logger.log('📤 [分享] 使用剪贴板复制');
    navigator.clipboard.writeText(text).then(() => {
      logger.log('📤 [分享] 已成功复制到剪贴板');
      alert('已复制到剪贴板！');
    }).catch(() => {
      logger.error('📤 [分享] 剪贴板复制失败');
      alert('复制失败，请手动复制');
    });
  }
}

// 分享到微信
function shareWeChat() {
  if (!result.value && !drawnTarot.value) {
    logger.warn('💬 [微信分享] 没有可分享的结果');
    return;
  }
  
  logger.log('💬 [微信分享] 开始微信分享操作...');
  let text;
  if (isTarotMode.value && drawnTarot.value) {
    text = `✨ ${name.value}的塔罗牌占卜 ✨\n\n抽到了【${drawnTarot.value.name}】\n\n🌟 含义：${drawnTarot.value.meaning}\n\n#塔罗牌占卜 #运势 #算命`;
  } else {
    text = `✨ ${name.value}的${questionType.value}运势 ✨\n\n🔮 预测：${result.value.prediction}\n💡 建议：${result.value.advice}\n\n#${questionType.value} #运势 #算命`;
  }
  navigator.clipboard.writeText(text).then(() => {
    logger.log('💬 [微信分享] 已成功复制到剪贴板');
    alert('已复制到剪贴板！请在微信中粘贴分享');
  }).catch(err => {
    logger.error('💬 [微信分享] 复制失败:', err);
  });
}

// 分享到微博
function shareWeibo() {
  if (!result.value && !drawnTarot.value) {
    logger.warn('📢 [微博分享] 没有可分享的结果');
    return;
  }
  
  logger.log('📢 [微博分享] 开始微博分享操作...');
  let content;
  if (isTarotMode.value && drawnTarot.value) {
    content = encodeURIComponent(`✨ ${name.value}的塔罗牌占卜 ✨\n\n抽到了【${drawnTarot.value.name}】\n\n🌟 含义：${drawnTarot.value.meaning.substring(0, 120)}...\n\n#塔罗牌占卜 #运势 #算命`);
  } else {
    content = encodeURIComponent(`✨ ${name.value}的${questionType.value}运势 ✨\n\n🔮 预测：${result.value.prediction.substring(0, 140)}...\n\n#${questionType.value} #运势 #算命`);
  }
  
  // 微博API需要的参数：url + content
  const shareUrl = encodeURIComponent(window.location.href);
  logger.log('📢 [微博分享] 打开微博分享页面');
  window.open(`https://service.weibo.com/share/share.php?url=${shareUrl}&content=${content}`, '_blank');
}

// 生成图片分享
function generateShareImage() {
  if (!result.value) {
    logger.warn('🖼️ [图片分享] 没有可分享的结果');
    return;
  }
  logger.log('🖼️ [图片分享] 打开分享卡片弹窗');
  showShareCard.value = true;
}

// 关闭分享卡片
function closeShareCard() {
  logger.log('🖼️ [图片分享] 关闭分享卡片');
  showShareCard.value = false;
}

// 获取当前算命类型名称
function getCurrentFortuneType() {
  if (result.value?.isBazi) return '八字算命';
  if (result.value?.isZiwei) return '紫微斗数';
  if (result.value?.isShengxiao) return '生肖运势';
  if (result.value?.isXingzuo) return '星座运势';
  if (result.value?.isXingming) return '姓名学';
  if (result.value?.isJiemeng) return '周公解梦';
  if (drawnTarot.value) return '塔罗牌占卜';
  return '传统算命';
}

// 导出为JSON
function exportToJSON(data, filename = 'fortune-data') {
  logger.log(`📄 [导出] 开始导出为 JSON - 文件名: ${filename}, 数据量: ${Array.isArray(data) ? data.length : 1}`);
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  logger.log('📄 [导出] JSON 导出完成');
}

// 导出为CSV
function exportToCSV(data, filename = 'fortune-data') {
  if (!data.length) {
    logger.warn('📊 [导出] 没有可导出的数据');
    return;
  }
  
  logger.log(`📊 [导出] 开始导出为 CSV - 文件名: ${filename}, 数据量: ${data.length}`);
  
  const headers = ['ID', '姓名', '出生日期', '问题类型', '星座', '生肖', '预测', '建议', '创建时间'];
  const csvContent = [
    headers.join(','),
    ...data.map(item => [
      item.id,
      `"${item.user_name}"`,
      `"${item.birth_date}"`,
      `"${item.question_type}"`,
      `"${item.zodiac_sign || ''}"`,
      `"${item.chinese_zodiac || ''}"`,
      `"${item.prediction.replace(/"/g, '""')}"`,
      `"${item.advice.replace(/"/g, '""')}"`,
      `"${item.created_at}"`
    ].join(','))
  ].join('\n');
  
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  logger.log('📊 [导出] CSV 导出完成');
}

// 塔罗牌占卜
function drawTarotCard() {
  drawTarotFromData(name.value, birthDate.value, '');
}

function drawTarotFromData(userName, userBirthDate, userQuestion) {
  console.log('=== 🔔 drawTarotFromData 被调用了！ ===');
  
  try {
    logger.log('🎴 [塔罗牌] 开始塔罗牌占卜...');
    logger.log(`🎴 [塔罗牌] 用户信息 - 姓名: ${userName || '未提供'}, 问题: ${userQuestion || '未提供'}`);
    
    // 检查 tarotCards 是否存在
    if (!tarotCards || !Array.isArray(tarotCards) || tarotCards.length === 0) {
      logger.error('🎴 [塔罗牌] 没有塔罗牌数据！');
      console.error('=== 🔴 错误：tarotCards 数据不存在！ ===');
      return;
    }
    
    logger.log(`🎴 [塔罗牌] 塔罗牌数据数量: ${tarotCards.length}`);
    
    // 确保在塔罗牌模式下！
    logger.log('🎴 [塔罗牌] 之前的模式：', isTarotMode.value);
    if (!isTarotMode.value) {
      logger.log('🎴 [塔罗牌] 切换到塔罗牌模式！');
      isTarotMode.value = true;
    }
    logger.log('🎴 [塔罗牌] 当前模式：', isTarotMode.value);
    
    const randomIndex = Math.floor(Math.random() * tarotCards.length);
    logger.log(`🎴 [塔罗牌] 随机索引: ${randomIndex}`);
    
    drawnTarot.value = tarotCards[randomIndex];
    logger.log(`🎴 [塔罗牌] 抽取成功 - 牌名: ${drawnTarot.value.name}, 含义: ${drawnTarot.value.meaning}`);
    console.log('=== 🔔 塔罗牌抽取完成！ ===');
    
    name.value = userName;
    birthDate.value = userBirthDate;
    question.value = userQuestion;
    
    // 保存到历史记录（简化处理）
    const historyItem = {
      id: Date.now(),
      user_name: name.value || '访客',
      birth_date: birthDate.value || '未知',
      question_type: '塔罗牌占卜',
      zodiac_sign: null,
      chinese_zodiac: null,
      prediction: `你抽到了【${drawnTarot.value.name}】牌！`,
      advice: drawnTarot.value.meaning,
      created_at: new Date().toISOString()
    };
    
    logger.log('🎴 [塔罗牌] 开始保存占卜历史...');
    history.value.unshift(historyItem);
    const historyKey = getUserStorageKey('fortuneHistory');
    localStorage.setItem(historyKey, JSON.stringify(history.value.slice(0, 20)));
    logger.log('🎴 [塔罗牌] 占卜历史保存完成');
    console.log('=== 🔔 drawTarotFromData 完成！ ===');
    
  } catch (error) {
    console.error('=== 🔴 drawTarotFromData 出错了！ ===', error);
    logger.error('🎴 [塔罗牌] 出错了！', error);
    alert(`塔罗牌占卜出错了：${error.message}`);
  }
}

// 切换模式
function toggleMode() {
  const newMode = !isTarotMode.value ? '塔罗牌' : '传统算命';
  const oldMode = isTarotMode.value ? '塔罗牌' : '传统算命';
  logger.log(`🔄 [模式] 切换应用模式 - 从 ${oldMode} 切换到 ${newMode}`);
  
  isTarotMode.value = !isTarotMode.value;
  if (!isTarotMode.value) {
    drawnTarot.value = null;
    logger.log('🔄 [模式] 清除塔罗牌结果');
  }
  logger.log('🔄 [模式] 模式切换完成');
}

// === 统计分析相关函数 ===

// 获取独立用户数
function getUniqueUsers() {
  const allRecords = [...history.value, ...favorites.value];
  const users = new Set();
  allRecords.forEach(r => users.add(r.user_name));
  return users.size;
}

// 问题类型分布
function getTypeDistribution() {
  const distribution = {};
  history.value.forEach(r => {
    const type = r.question_type || '其他';
    distribution[type] = (distribution[type] || 0) + 1;
  });
  return distribution;
}

// 星座分布
function getZodiacDistribution() {
  const distribution = {};
  history.value.forEach(r => {
    const zodiac = r.zodiac_sign || '未知';
    distribution[zodiac] = (distribution[zodiac] || 0) + 1;
  });
  return distribution;
}

// 按日期分组的趋势数据
function getDateTrend() {
  const trend = {};
  history.value.forEach(r => {
    const date = r.created_at ? r.created_at.slice(0, 10) : '未知';
    trend[date] = (trend[date] || 0) + 1;
  });
  
  const sortedDates = Object.keys(trend).sort();
  return {
    labels: sortedDates,
    data: sortedDates.map(date => trend[date])
  };
}

// 渲染所有图表
function renderCharts() {
  logger.log('📊 [统计] 开始渲染统计图表...');
  
  nextTick(() => {
    logger.log('📊 [统计] 渲染饼图...');
    renderPieChart();
    logger.log('📊 [统计] 渲染柱状图...');
    renderBarChart();
    logger.log('📊 [统计] 渲染折线图...');
    renderLineChart();
    logger.log('📊 [统计] 所有图表渲染完成');
  });
}

// 饼图（问题类型分布）
function renderPieChart() {
  logger.log('📊 [图表] 渲染问题类型分布饼图...');
  
  if (pieChart) {
    logger.log('📊 [图表] 销毁旧的饼图实例');
    pieChart.destroy();
  }
  
  const ctx = document.getElementById('pieChart');
  if (!ctx) {
    logger.warn('📊 [图表] 找不到 pieChart 元素');
    return;
  }
  
  const distribution = getTypeDistribution();
  const labels = Object.keys(distribution);
  const data = Object.values(distribution);
  
  logger.log(`📊 [图表] 饼图数据: ${JSON.stringify(distribution)}`);
  
  const isMobile = window.innerWidth <= 480;
  logger.log(`📊 [图表] 设备类型: ${isMobile ? '移动端' : '桌面端'}`);
  
  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: chartColors.slice(0, labels.length),
        borderWidth: isMobile ? 1 : 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: isMobile ? 'bottom' : 'bottom',
          labels: {
            padding: isMobile ? 10 : 15,
            font: { size: isMobile ? 10 : 12 }
          }
        }
      }
    }
  });
  logger.log('📊 [图表] 饼图渲染完成');
}

// 柱状图（星座分布）
function renderBarChart() {
  logger.log('📊 [图表] 渲染星座分布柱状图...');
  
  if (barChart) {
    logger.log('📊 [图表] 销毁旧的柱状图实例');
    barChart.destroy();
  }
  
  const ctx = document.getElementById('barChart');
  if (!ctx) {
    logger.warn('📊 [图表] 找不到 barChart 元素');
    return;
  }
  
  const distribution = getZodiacDistribution();
  const labels = Object.keys(distribution);
  const data = Object.values(distribution);
  
  logger.log(`📊 [图表] 柱状图数据: ${JSON.stringify(distribution)}`);
  
  const isMobile = window.innerWidth <= 480;
  logger.log(`📊 [图表] 设备类型: ${isMobile ? '移动端' : '桌面端'}`);
  
  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '人数',
        data: data,
        backgroundColor: chartColors.slice(0, labels.length),
        borderRadius: isMobile ? 4 : 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            font: { size: isMobile ? 10 : 12 }
          }
        },
        x: {
          ticks: {
            maxRotation: isMobile ? 90 : 45,
            minRotation: isMobile ? 45 : 0,
            font: { size: isMobile ? 9 : 11 }
          }
        }
      }
    }
  });
  logger.log('📊 [图表] 柱状图渲染完成');
}

// 折线图（日期趋势）
function renderLineChart() {
  logger.log('📊 [图表] 渲染日期趋势折线图...');
  
  if (lineChart) {
    logger.log('📊 [图表] 销毁旧的折线图实例');
    lineChart.destroy();
  }
  
  const ctx = document.getElementById('lineChart');
  if (!ctx) {
    logger.warn('📊 [图表] 找不到 lineChart 元素');
    return;
  }
  
  const trend = getDateTrend();
  
  logger.log(`📊 [图表] 折线图数据点: ${trend.labels.length} 个`);
  
  const isMobile = window.innerWidth <= 480;
  logger.log(`📊 [图表] 设备类型: ${isMobile ? '移动端' : '桌面端'}`);
  
  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: trend.labels,
      datasets: [{
        label: '算命次数',
        data: trend.data,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102,126,234,0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: isMobile ? 2 : 3,
        pointBackgroundColor: '#667eea',
        pointBorderColor: '#fff',
        pointBorderWidth: isMobile ? 1 : 2,
        pointRadius: isMobile ? 4 : 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: { size: isMobile ? 10 : 12 }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            font: { size: isMobile ? 10 : 12 }
          }
        },
        x: {
          ticks: {
            maxRotation: isMobile ? 90 : 45,
            minRotation: isMobile ? 45 : 0,
            font: { size: isMobile ? 9 : 11 }
          }
        }
      }
    }
  });
  logger.log('📊 [图表] 折线图渲染完成');
}

// 导出当前算命结果
function exportCurrentResult() {
  logger.log('📥 [导出] 导出当前算命结果...');
  
  if (!result.value && !drawnTarot.value) {
    logger.warn('📥 [导出] 没有可导出的结果');
    return;
  }
  
  let data;
  if (isTarotMode.value) {
    data = {
      type: '塔罗牌占卜',
      card: drawnTarot.value.name,
      meaning: drawnTarot.value.meaning,
      name: name.value,
      timestamp: new Date().toISOString()
    };
    logger.log('📥 [导出] 准备导出塔罗牌结果');
  } else {
    data = {
      type: '传统算命',
      name: name.value,
      birthDate: birthDate.value,
      questionType: questionType.value,
      zodiacSign: result.value.zodiac_sign,
      chineseZodiac: result.value.chinese_zodiac,
      prediction: result.value.prediction,
      advice: result.value.advice,
      timestamp: new Date().toISOString()
    };
    logger.log('📥 [导出] 准备导出传统算命结果');
  }
  
  logger.log(`📥 [导出] 导出数据: ${JSON.stringify({ type: data.type, name: data.name })}`);
  
  exportToJSON([data], 'fortune-result');
  logger.log('📥 [导出] 导出流程完成');
}
</script>

<template>
  <!-- 3D宇宙星河背景 -->
  <div class="galaxy-background"></div>
  <div id="galaxy-container" class="galaxy-container"></div>
  
  <!-- 主应用容器 -->
  <div id="galaxy-app" :class="['app-container', 'galaxy-app', { 'dark-mode': isDarkMode }]">
    
    <!-- 登录页面 -->
    <div v-if="showLoginPage" class="login-page">
      <div class="login-container">
        <div class="login-left">
          <div class="login-decoration">
            <div class="decoration-circle decoration-1"></div>
            <div class="decoration-circle decoration-2"></div>
            <div class="decoration-circle decoration-3"></div>
          </div>
          <div class="login-welcome">
            <div class="login-icon">🌟</div>
            <h2>欢迎回来！</h2>
            <p>探索你的专属命运指引</p>
          </div>
        </div>
        
        <div class="login-right">
          <div class="login-box">
            <button class="close-login-btn" @click="showLoginPage = false">
              ✕
            </button>
            
            <div class="auth-tabs">
              <button 
                :class="['auth-tab', { active: authMode === 'login' }]" 
                @click="authMode = 'login'; clearAllAuthErrors()"
              >
                登录
              </button>
              <button 
                :class="['auth-tab', { active: authMode === 'register' }]" 
                @click="authMode = 'register'; clearAllAuthErrors()"
              >
                注册
              </button>
            </div>
            
            <!-- 登录表单 -->
            <form v-if="authMode === 'login'" class="auth-form" @submit.prevent="handleAuthLogin">
              <div class="form-group" :class="{ 'has-error': authFieldErrors.loginUsername }">
                <label>用户名</label>
                <div class="input-wrapper">
                  <span class="input-icon">👤</span>
                  <input 
                    type="text" 
                    v-model="loginUsername" 
                    :class="['form-input', { 'input-error': authFieldErrors.loginUsername }]"
                    placeholder="请输入用户名"
                    @input="clearFieldError('loginUsername')"
                  />
                </div>
                <span v-if="authFieldErrors.loginUsername" class="field-error">{{ authFieldErrors.loginUsername }}</span>
              </div>
              
              <div class="form-group" :class="{ 'has-error': authFieldErrors.loginPassword }">
                <label>密码</label>
                <div class="input-wrapper">
                  <span class="input-icon">🔒</span>
                  <input 
                    type="password" 
                    v-model="loginPassword" 
                    :class="['form-input', { 'input-error': authFieldErrors.loginPassword }]"
                    placeholder="请输入密码"
                    @input="clearFieldError('loginPassword')"
                  />
                </div>
                <span v-if="authFieldErrors.loginPassword" class="field-error">{{ authFieldErrors.loginPassword }}</span>
              </div>
              
              <!-- 验证码 -->
              <div class="form-group" :class="{ 'has-error': authFieldErrors.captcha }">
                <label>验证码</label>
                <div class="captcha-wrapper">
                  <div class="input-wrapper captcha-input-wrapper">
                    <span class="input-icon">🔐</span>
                    <input 
                      type="text" 
                      v-model="captchaInput" 
                      :class="['form-input', { 'input-error': authFieldErrors.captcha }]"
                      placeholder="请输入验证码"
                      maxlength="4"
                      @input="clearFieldError('captcha')"
                    />
                  </div>
                  <canvas 
                    ref="captchaCanvas" 
                    class="captcha-canvas" 
                    @click="refreshCaptcha"
                    title="点击刷新验证码"
                  ></canvas>
                </div>
                <span v-if="authFieldErrors.captcha" class="field-error">{{ authFieldErrors.captcha }}</span>
              </div>
              
              <!-- 记住密码 -->
              <div class="form-group remember-me-wrapper">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    v-model="rememberMe" 
                    class="checkbox-input"
                  />
                  <span class="checkbox-text">记住密码</span>
                </label>
              </div>
              
              <div v-if="authError" class="auth-error" :class="{ 'shake': authError }">
                <span class="error-icon">⚠️</span>
                <span>{{ authError }}</span>
              </div>
              
              <button type="submit" class="auth-btn" :disabled="authLoading">
                <span v-if="authLoading" class="btn-loading">
                  <span class="loading-spinner"></span>
                  登录中...
                </span>
                <span v-else>登录</span>
              </button>
              
              <p class="auth-footer">
                还没有账号？
                <a @click="authMode = 'register'; clearAllAuthErrors()">立即注册</a>
              </p>
            </form>
            
            <!-- 注册表单 -->
            <form v-if="authMode === 'register'" class="auth-form" @submit.prevent="handleAuthRegister">
              <div class="form-group" :class="{ 'has-error': authFieldErrors.registerUsername }">
                <label>用户名</label>
                <div class="input-wrapper">
                  <span class="input-icon">👤</span>
                  <input 
                    type="text" 
                    v-model="registerUsername" 
                    :class="['form-input', { 'input-error': authFieldErrors.registerUsername }]"
                    placeholder="请输入用户名（至少3个字符）"
                    @input="clearFieldError('registerUsername')"
                  />
                </div>
                <span v-if="authFieldErrors.registerUsername" class="field-error">{{ authFieldErrors.registerUsername }}</span>
              </div>
              
              <div class="form-group" :class="{ 'has-error': authFieldErrors.registerPassword }">
                <label>密码</label>
                <div class="input-wrapper">
                  <span class="input-icon">🔒</span>
                  <input 
                    type="password" 
                    v-model="registerPassword" 
                    :class="['form-input', { 'input-error': authFieldErrors.registerPassword }]"
                    placeholder="请输入密码（至少6个字符）"
                    @input="clearFieldError('registerPassword')"
                  />
                </div>
                <!-- 密码强度指示器 -->
                <div v-if="registerPassword" class="password-strength">
                  <div class="strength-bar">
                    <div 
                      class="strength-fill" 
                      :style="{ 
                        width: (passwordStrength.score / passwordStrength.maxScore * 100) + '%',
                        backgroundColor: passwordStrength.color 
                      }"
                    ></div>
                  </div>
                  <span class="strength-label" :style="{ color: passwordStrength.color }">
                    密码强度：{{ passwordStrength.label }}
                  </span>
                  <div class="strength-tips">
                    <span :class="{ 'met': registerPassword.length >= 6 }">✓ 至少6位</span>
                    <span :class="{ 'met': /[a-z]/.test(registerPassword) }">✓ 小写字母</span>
                    <span :class="{ 'met': /[A-Z]/.test(registerPassword) }">✓ 大写字母</span>
                    <span :class="{ 'met': /[0-9]/.test(registerPassword) }">✓ 数字</span>
                    <span :class="{ 'met': /[^a-zA-Z0-9]/.test(registerPassword) }">✓ 特殊字符</span>
                  </div>
                </div>
                <span v-if="authFieldErrors.registerPassword" class="field-error">{{ authFieldErrors.registerPassword }}</span>
              </div>
              
              <div class="form-group" :class="{ 'has-error': authFieldErrors.registerConfirm }">
                <label>确认密码</label>
                <div class="input-wrapper">
                  <span class="input-icon">🔐</span>
                  <input 
                    type="password" 
                    v-model="registerConfirm" 
                    :class="['form-input', { 'input-error': authFieldErrors.registerConfirm }]"
                    placeholder="请再次输入密码"
                    @input="clearFieldError('registerConfirm')"
                  />
                </div>
                <span v-if="authFieldErrors.registerConfirm" class="field-error">{{ authFieldErrors.registerConfirm }}</span>
              </div>
              
              <div v-if="authError" class="auth-error" :class="{ 'shake': authError }">
                <span class="error-icon">⚠️</span>
                <span>{{ authError }}</span>
              </div>
              
              <button type="submit" class="auth-btn" :disabled="authLoading">
                <span v-if="authLoading" class="btn-loading">
                  <span class="loading-spinner"></span>
                  注册中...
                </span>
                <span v-else>注册</span>
              </button>
              
              <p class="auth-footer">
                已有账号？
                <a @click="authMode = 'login'; clearAllAuthErrors()">立即登录</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 主应用内容 - 仅在未显示登录页面时显示 -->
    <div v-else class="main-app-content">
    <div class="header-banner">
      <div class="header-top">
        <h1 class="title galaxy-title">
          <span v-if="isTarotMode">🃏 神秘塔罗</span>
          <span v-else>🌟 命运之轮</span>
        </h1>
        <div class="header-buttons">
          <button class="theme-toggle galaxy-button" @click="toggleMode">
            {{ isTarotMode ? '✨ 传统模式' : '🃏 塔罗牌' }}
          </button>
          <button class="theme-toggle galaxy-button" @click="toggleTheme">
            {{ isDarkMode ? '☀️ 浅色' : '🌙 深色' }}
          </button>
          <button class="theme-toggle galaxy-button" @click="showSettingsModal = true">
            ⚙️ 设置
          </button>
          <button v-if="isLoggedIn" class="theme-toggle galaxy-button" @click="handleLogout">
            👋 退出 {{ currentUser.username }}
          </button>
          <button v-else class="theme-toggle galaxy-button" @click="showLoginPage = true">
            🔑 登录
          </button>
          <button v-if="!isLoggedIn" class="theme-toggle galaxy-button" @click="showLoginPage = true; authMode = 'register'">
            📝 注册
          </button>
        </div>
      </div>
      <p class="subtitle">
        <span v-if="isTarotMode">探索神秘的塔罗世界</span>
        <span v-else>探索你的专属命运指引</span>
      </p>
    </div>
    
    <div class="tabs">
      <button 
        :class="['tab-btn', 'galaxy-tab', { active: activeTab === 'fortune' }]" 
        @click="switchTabWithTransition('fortune')"
      >
        🔮 算命
      </button>
      <button 
        :class="['tab-btn', 'galaxy-tab', { active: activeTab === 'history' }]" 
        @click="switchTabWithTransition('history')"
      >
        📜 历史
      </button>
      <button 
        :class="['tab-btn', 'galaxy-tab', { active: activeTab === 'favorites' }]" 
        @click="switchTabWithTransition('favorites')"
      >
        ⭐ 收藏 {{ favorites.length > 0 ? `(${favorites.length})` : '' }}
      </button>
      <button 
        :class="['tab-btn', 'galaxy-tab', { active: activeTab === 'stats' }]" 
        @click="switchTabWithTransition('stats')"
      >
        📊 统计
      </button>
    </div>

    <!-- 骨架屏 -->
    <Transition name="skeleton">
      <div v-if="showSkeleton" class="skeleton-container">
        <!-- 算命页面骨架屏 -->
        <div v-if="skeletonType === 'fortune'" class="skeleton-fortune">
          <div class="skeleton-header">
            <div class="skeleton-title"></div>
            <div class="skeleton-subtitle"></div>
          </div>
          <div class="skeleton-form">
            <div class="skeleton-input" v-for="i in 4" :key="i"></div>
            <div class="skeleton-button"></div>
          </div>
        </div>
        
        <!-- 历史记录骨架屏 -->
        <div v-if="skeletonType === 'history'" class="skeleton-history">
          <div class="skeleton-item" v-for="i in 5" :key="i">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-content">
              <div class="skeleton-line"></div>
              <div class="skeleton-line short"></div>
            </div>
          </div>
        </div>
        
        <!-- 收藏页面骨架屏 -->
        <div v-if="skeletonType === 'favorites'" class="skeleton-favorites">
          <div class="skeleton-item" v-for="i in 4" :key="i">
            <div class="skeleton-icon"></div>
            <div class="skeleton-content">
              <div class="skeleton-line"></div>
              <div class="skeleton-line short"></div>
            </div>
          </div>
        </div>
        
        <!-- 统计页面骨架屏 -->
        <div v-if="skeletonType === 'stats'" class="skeleton-stats">
          <div class="skeleton-cards">
            <div class="skeleton-card" v-for="i in 3" :key="i"></div>
          </div>
          <div class="skeleton-chart"></div>
        </div>
      </div>
    </Transition>

    <Transition :name="tabTransition" mode="out-in">
      <div v-if="activeTab === 'fortune'" class="tab-content active" key="fortune">
        <!-- 使用新的 FortuneForm 组件 -->
        <FortuneForm
          :loading="loading"
          :isTarotMode="isTarotMode"
          @get-fortune="handleGetFortune"
          @draw-tarot="handleDrawTarot"
          @get-bazi="handleGetBazi"
          @get-ziwei="handleGetZiwei"
          @get-shengxiao="handleGetShengxiao"
          @get-xingzuo="handleGetXingzuo"
          @get-xingming="handleGetXingming"
          @get-jiemeng="handleGetJiemeng"
          @change-mode="handleChangeMode"
        />
      
      <!-- 塔罗牌结果 -->
      <div v-if="drawnTarot" class="result-container" style="margin-top: 20px;">
        <div class="result-header">
          <h3 class="section-title">✨ 你的命运卡牌</h3>
          <button class="favorite-btn" @click="toggleFavorite">
            {{ isFavorite() ? '❤️ 已收藏' : '🤍 收藏' }}
          </button>
        </div>
        
        <div class="result-card">
          <div class="tarot-card">
            <div class="tarot-name">{{ drawnTarot.name }}</div>
            <div class="tarot-meaning">{{ drawnTarot.meaning }}</div>
          </div>
        </div>
      </div>
      
      <div v-if="result" class="result-container">
        <div class="result-header">
          <h2 class="section-title">🌟 算命结果</h2>
          <div class="result-actions">
            <button class="favorite-btn" @click="toggleFavorite">
              {{ isFavorite() ? '❤️ 已收藏' : '🤍 收藏' }}
            </button>
            <div class="share-dropdown">
              <button class="share-btn">
                📤 分享
              </button>
              <div class="share-options">
                <button class="share-option" @click="shareResult">
                  📋 复制文本
                </button>
                <button class="share-option" @click="shareWeChat">
                  💬 微信
                </button>
                <button class="share-option" @click="shareWeibo">
                  📢 微博
                </button>
                <button class="share-option" @click="generateShareImage">
                  🖼️ 生成图片
                </button>
                <button class="share-option" @click="exportCurrentResult">
                  📥 导出结果
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="result-card">
          <div class="result-avatar">
          </div>
          <div class="result-content">
            <div class="result-item">
              <span class="result-label">🔮 预测：</span>
              <p class="result-value">{{ result.prediction }}</p>
            </div>
            <div class="result-item">
              <span class="result-label">💡 建议：</span>
              <p class="result-value">{{ result.advice }}</p>
            </div>
          </div>
        </div>
      </div>
    </div></Transition>

    <Transition :name="tabTransition" mode="out-in"><div v-if="activeTab === 'history'" class="tab-content active" key="history">
      <div v-if="history.length > 0">
        <div class="history-header">
          <h2 class="section-title">📜 历史记录</h2>
          <div class="history-actions-group">
            <div class="export-dropdown">
              <button class="clear-btn">
                📥 导出
              </button>
              <div class="export-options">
                <button class="export-option" @click="exportToJSON(filteredHistory, 'history')">
                  📄 JSON格式
                </button>
                <button class="export-option" @click="exportToCSV(filteredHistory, 'history')">
                  📊 CSV格式
                </button>
              </div>
            </div>
            <button class="clear-btn" @click="clearHistory">
              🗑️ 清空历史
            </button>
          </div>
        </div>
        
        <!-- 搜索和筛选区域 -->
        <div class="search-filter-container">
          <input 
            type="text" 
            class="search-input"
            v-model="searchQuery"
            placeholder="🔍 搜索姓名、类型、星座..."
          />
          <select 
            class="filter-select"
            v-model="filterType"
          >
            <option value="">全部类型</option>
            <option v-for="type in allTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>
        
        <!-- 显示搜索结果数量 -->
        <div v-if="searchQuery || filterType" class="search-result-info">
          找到 {{ filteredHistory.length }} 条结果
          <button 
            v-if="searchQuery || filterType"
            class="clear-filter-btn"
            @click="clearFilter"
          >
            清除筛选
          </button>
        </div>
        
        <div class="history-list">
          <div 
            v-for="item in filteredHistory" :key="item.id"
            class="history-item"
          >
            <div class="history-info">
              <div class="history-name">
                {{ item.user_name }} - {{ item.question_type }}
                <span v-if="item.zodiac_sign" class="zodiac-tag">
                  {{ item.zodiac_sign }}
                </span>
                <span v-if="item.chinese_zodiac" class="zodiac-tag">
                  {{ item.chinese_zodiac }}
                </span>
              </div>
              <div class="history-time">{{ item.created_at }}</div>
            </div>
            <div class="history-actions">
              <button class="view-btn" @click="viewFromHistory(item)">
                👁️ 查看
              </button>
              <button class="delete-btn" @click="deleteHistory(item.id)">
                🗑️ 删除
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-history">
        <p>暂无历史记录</p>
        <button class="back-btn" @click="activeTab = 'fortune'">
          🔮 去算命
        </button>
      </div>
    </div>

    <!-- 收藏标签页 -->
    <div v-if="activeTab === 'favorites'" class="tab-content active" key="favorites">
      <div v-if="favorites.length > 0">
        <div class="history-header">
          <h2 class="section-title">⭐ 我的收藏</h2>
          <div class="history-actions-group">
            <div class="export-dropdown">
              <button class="clear-btn">
                📥 导出
              </button>
              <div class="export-options">
                <button class="export-option" @click="exportToJSON(filteredFavorites, 'favorites')">
                  📄 JSON格式
                </button>
                <button class="export-option" @click="exportToCSV(filteredFavorites, 'favorites')">
                  📊 CSV格式
                </button>
              </div>
            </div>
            <button class="clear-btn" @click="clearFavorites">
              🗑️ 清空
            </button>
          </div>
        </div>
        
        <!-- 搜索和筛选区域 -->
        <div class="search-filter-container">
          <input 
            type="text" 
            class="search-input"
            v-model="searchQuery"
            placeholder="🔍 搜索姓名、类型、星座..."
          />
          <select 
            class="filter-select"
            v-model="filterType"
          >
            <option value="">全部类型</option>
            <option v-for="type in allTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>
        
        <!-- 显示搜索结果数量 -->
        <div v-if="searchQuery || filterType" class="search-result-info">
          找到 {{ filteredFavorites.length }} 条结果
          <button 
            v-if="searchQuery || filterType"
            class="clear-filter-btn"
            @click="clearFilter"
          >
            清除筛选
          </button>
        </div>
        
        <div class="history-list">
          <div 
            v-for="item in filteredFavorites" :key="item.id"
            class="history-item"
          >
            <div class="history-info">
              <div class="history-name">
                {{ item.user_name }} - {{ item.question_type }}
                <span v-if="item.zodiac_sign" class="zodiac-tag">
                  {{ item.zodiac_sign }}
                </span>
                <span v-if="item.chinese_zodiac" class="zodiac-tag">
                  {{ item.chinese_zodiac }}
                </span>
                <span class="zodiac-tag" style="background: linear-gradient(135deg, #ff6b6b, #ffd93d);">⭐ 收藏</span>
              </div>
              <div class="history-time">{{ item.created_at }}</div>
            </div>
            <div class="history-actions">
              <button class="view-btn" @click="viewFromHistory(item)">
                👁️ 查看
              </button>
              <button class="delete-btn" @click="removeFavorite(item.id)">
                💔 移除
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-history">
        <p>暂无收藏</p>
        <button class="back-btn" @click="activeTab = 'fortune'">
          🔮 去算命
        </button>
      </div>
    </div>
    
    <!-- 统计标签页 -->
    <div v-if="activeTab === 'stats'" class="tab-content active" key="stats">
      <div class="stats-container">
        <h2 class="section-title">📊 运势统计分析</h2>
        
        <!-- 统计概览卡片 -->
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-value">{{ history.length + favorites.length }}</div>
            <div class="stat-label">总记录数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ getUniqueUsers() }}</div>
            <div class="stat-label">用户数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ favorites.length }}</div>
            <div class="stat-label">收藏数</div>
          </div>
        </div>
        
        <!-- 图表区域 -->
        <div v-if="history.length > 0" class="charts-grid">
          <div class="chart-card">
            <h3>🎯 问题类型分布</h3>
            <canvas id="pieChart"></canvas>
          </div>
          
          <div class="chart-card">
            <h3>🌟 星座分布</h3>
            <canvas id="barChart"></canvas>
          </div>
          
          <div class="chart-card" style="grid-column: 1 / -1;">
            <h3>📈 算命趋势</h3>
            <canvas id="lineChart"></canvas>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-else class="empty-history">
          <p>暂无数据，先去算命吧！</p>
          <button class="back-btn" @click="activeTab = 'fortune'">
            🔮 去算命
          </button>
        </div>
      </div>
    </div></Transition>
    
    <!-- 旧的登录注册模态框已隐藏，使用新的登录页面 -->
    
    <!-- 注册模态框（已隐藏） -->
    <div v-if="false && showRegisterModal" class="modal-overlay" @click.self="showRegisterModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>📝 用户注册</h3>
          <button class="close-btn" @click="showRegisterModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>用户名</label>
            <input 
              type="text" 
              v-model="registerUsername" 
              class="form-input"
              placeholder="请输入用户名"
            />
          </div>
          <div class="form-group">
            <label>密码</label>
            <input 
              type="password" 
              v-model="registerPassword" 
              class="form-input"
              placeholder="请输入密码"
            />
          </div>
          <div class="form-group">
            <label>确认密码</label>
            <input 
              type="password" 
              v-model="registerConfirm" 
              class="form-input"
              placeholder="请再次输入密码"
            />
          </div>
          <div class="modal-buttons">
            <button class="btn-primary" @click="handleRegister">注册</button>
            <button class="btn-secondary" @click="showRegisterModal = false">取消</button>
          </div>
          <p style="text-align: center; margin-top: 10px;">
            已有账号？
            <a @click="showRegisterModal = false; showLoginModal = true" style="color: #667eea; cursor: pointer;">
              去登录
            </a>
          </p>
        </div>
      </div>
    </div>
    
    <!-- 设置模态框 -->
    <div v-if="showSettingsModal" class="modal-overlay" @click.self="showSettingsModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>⚙️ 设置</h3>
          <button class="close-btn" @click="showSettingsModal = false">✕</button>
        </div>
        <div class="modal-body">
          <h4 style="margin-bottom: 20px;">🔔 每日运势推送</h4>
          
          <div class="form-group">
            <label>开启推送</label>
            <div class="toggle-switch">
              <button 
                :class="['toggle-btn', { active: isPushEnabled }]" 
                @click="togglePushNotification"
              >
                {{ isPushEnabled ? '✅ 已开启' : '❌ 已关闭' }}
              </button>
            </div>
          </div>
          
          <div v-if="isPushEnabled" class="form-group">
            <label>推送时间</label>
            <input 
              type="time" 
              v-model="pushTime"
              class="form-input"
              @change="updatePushTime"
            />
          </div>
          
          <div v-if="isPushEnabled" style="padding: 15px; background: rgba(102,126,234,0.1); border-radius: 8px; margin-top: 15px;">
            <p style="margin: 0; color: #667eea;">
              💡 开启后，每天 {{ pushTime.value }} 会收到运势提醒通知
            </p>
          </div>
          
          <div class="modal-buttons" style="margin-top: 30px;">
            <button class="btn-secondary" @click="showSettingsModal = false">关闭</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- 分享卡片组件 -->
<ShareCard
  :show="showShareCard"
  :result="result"
  :user-name="currentUserName || name"
  :fortune-type="getCurrentFortuneType()"
  @close="closeShareCard"
/>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: transparent;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  transition: all 0.3s ease;
}

/* 深色模式样式 */
.app-container.dark-mode {
  background: transparent;
}

.header-banner {
  text-align: center;
  padding: 30px 0;
  color: white;
}

.header-top {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 10px;
}

.theme-toggle {
  padding: 8px 16px;
  border: 2px solid rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.1);
  color: white;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background: rgba(255,255,255,0.2);
  transform: scale(1.05);
}

/* 深色模式下的表单样式 */
.app-container.dark-mode .form-container,
.app-container.dark-mode .result-container,
.app-container.dark-mode .history-item {
  background: #1e293b;
  color: #e2e8f0;
}

.app-container.dark-mode .form-group label {
  color: #e2e8f0;
}

.app-container.dark-mode .form-input {
  background: #334155;
  border-color: #475569;
  color: #e2e8f0;
}

.app-container.dark-mode .form-input:focus {
  border-color: #818cf8;
}

.app-container.dark-mode .type-btn {
  background: #334155;
  border-color: #475569;
  color: #cbd5e1;
}

.app-container.dark-mode .type-btn:hover {
  background: #475569;
  border-color: #64748b;
}

.app-container.dark-mode .type-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(102,126,234,0.4);
}

.app-container.dark-mode .btn-secondary {
  background: #334155;
  border-color: #475569;
  color: #cbd5e1;
}

.app-container.dark-mode .btn-secondary:hover {
  background: #475569;
  border-color: #64748b;
}

.app-container.dark-mode .section-title {
  color: #e2e8f0;
}

.app-container.dark-mode .result-label {
  color: #94a3b8;
}

.app-container.dark-mode .result-value {
  color: #cbd5e1;
}

.app-container.dark-mode .history-name {
  color: #e2e8f0;
}

.app-container.dark-mode .history-time {
  color: #94a3b8;
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

.tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  background: rgba(255,255,255,0.2);
  color: white;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-2px);
}

.tab-btn.active {
  background: white;
  color: #667eea;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.tab-content {
  max-width: 700px;
  margin: 0 auto;
  display: none;
}

.tab-content.active {
  display: block;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-title {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 20px;
}

.form-container {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  margin-bottom: 30px;
  animation: slideUp 0.5s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-group {
  margin-bottom: 20px;
}

.form-content-wrapper {
  max-width: 380px;
  margin: 0 auto;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #667eea;
  background: #ffffff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(102,126,234,0.1);
}

.question-types {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.type-btn {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  background: #fafafa;
  transition: all 0.3s ease;
  color: #4b5563;
}

.type-btn:hover {
  background: #f3f4f6;
  transform: translateY(-1px);
  border-color: #d1d5db;
}

.type-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(102,126,234,0.3);
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 25px;
}

.btn-primary {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  flex: 1;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  background: #fafafa;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #f5f5f5;
}

.error-message {
  margin-top: 15px;
  padding: 12px;
  background: #ffe6e6;
  color: #cc0000;
  border-radius: 8px;
  border-left: 4px solid #cc0000;
}

.result-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  overflow: hidden;
  animation: slideUp 0.5s ease;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px 10px 30px;
}

.result-actions {
  display: flex;
  gap: 10px;
}

.share-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.share-btn:hover {
  transform: scale(1.05);
}

.favorite-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ffd93d 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.favorite-btn:hover {
  transform: scale(1.05);
}

.share-dropdown {
  position: relative;
  display: inline-block;
}

.share-options {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  padding: 8px 0;
  min-width: 160px;
  z-index: 1000;
  display: none;
  flex-direction: column;
}

.share-dropdown:hover .share-options {
  display: flex;
}

.share-option {
  padding: 10px 16px;
  background: transparent;
  border: none;
  color: #333;
  font-size: 0.95rem;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.share-option:hover {
  background: #f5f5f5;
  color: #667eea;
}

/* 深色模式下的分享选项 */
.app-container.dark-mode .share-options {
  background: #1e293b;
}

.app-container.dark-mode .share-option {
  color: #e2e8f0;
}

.app-container.dark-mode .share-option:hover {
  background: #334155;
  color: #818cf8;
}

.result-card {
  padding: 30px;
}

.result-avatar {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  margin: 0 auto 25px auto;
}

.result-content {
  text-align: left;
}

.result-item {
  margin-bottom: 25px;
}

.result-label {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
}

.result-value {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #555;
  margin-top: 10px;
}

.tarot-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 30px;
  border-radius: 16px;
  color: white;
  text-align: center;
  border: 2px solid #818cf8;
}

.tarot-name {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 15px;
  color: #fbbf24;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
}

.tarot-meaning {
  font-size: 1.2rem;
  line-height: 1.8;
  color: #e2e8f0;
}

.header-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-filter-container {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 12px 16px;
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 10px;
  font-size: 1rem;
  background: rgba(255,255,255,0.08);
  color: white;
  outline: none;
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: rgba(255,255,255,0.6);
}

.search-input:focus {
  border-color: rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.12);
  box-shadow: 0 0 0 2px rgba(255,255,255,0.1);
}

.filter-select {
  padding: 12px 16px;
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 10px;
  font-size: 1rem;
  background: rgba(255,255,255,0.08);
  color: white;
  outline: none;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.filter-select:hover {
  border-color: rgba(255,255,255,0.5);
}

.filter-select option {
  background: #1e293b;
  color: white;
}

.search-result-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 16px;
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
}

.clear-filter-btn {
  padding: 4px 12px;
  border: 1px solid rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.1);
  color: white;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-filter-btn:hover {
  background: rgba(255,255,255,0.2);
}

.history-actions-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.export-dropdown {
  position: relative;
  display: inline-block;
}

.export-options {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  padding: 8px 0;
  min-width: 160px;
  z-index: 1000;
  display: none;
  flex-direction: column;
}

.export-dropdown:hover .export-options {
  display: flex;
}

.export-option {
  padding: 10px 16px;
  background: transparent;
  border: none;
  color: #333;
  font-size: 0.95rem;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.export-option:hover {
  background: #f5f5f5;
  color: #667eea;
}

/* 深色模式下的导出选项 */
.app-container.dark-mode .export-options {
  background: #1e293b;
}

.app-container.dark-mode .export-option {
  color: #e2e8f0;
}

.app-container.dark-mode .export-option:hover {
  background: #334155;
  color: #818cf8;
}

.clear-btn {
  padding: 8px 16px;
  background: rgba(255,255,255,0.2);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: rgba(255,255,255,0.3);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.history-info {
  flex: 1;
}

.history-name {
  font-weight: 700;
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.zodiac-tag {
  font-size: 0.8rem;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  white-space: nowrap;
}

.history-time {
  color: #666;
  font-size: 0.9rem;
}

.history-actions {
  display: flex;
  gap: 8px;
}

.view-btn, .delete-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-btn {
  background: #667eea;
  color: white;
}

.delete-btn {
  background: #ff6b6b;
  color: white;
}

.view-btn:hover, .delete-btn:hover {
  transform: scale(1.05);
}

.empty-history {
  text-align: center;
  padding: 50px 20px;
  color: white;
}

.empty-history p {
  font-size: 1.2rem;
  margin-bottom: 20px;
  opacity: 0.9;
}

.back-btn {
  padding: 12px 30px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

.app-container.dark-mode .modal-content {
  background: #1e293b;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.app-container.dark-mode .modal-header {
  border-bottom-color: #334155;
}

.modal-header h3 {
  margin: 0;
  color: #1f2937;
}

.app-container.dark-mode .modal-header h3 {
  color: #f9fafb;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #374151;
}

.modal-body {
  padding: 24px;
}

.modal-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.modal-buttons .btn-primary,
.modal-buttons .btn-secondary {
  flex: 1;
}

/* 切换按钮样式 */
.toggle-switch {
  display: flex;
}

.toggle-btn {
  padding: 10px 20px;
  border: 2px solid #ddd;
  border-radius: 20px;
  background: #f5f5f5;
  color: #666;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  border-color: #667eea;
}

.toggle-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

/* 深色模式下的切换按钮 */
.app-container.dark-mode .toggle-btn {
  background: #334155;
  border-color: #475569;
  color: #e2e8f0;
}

.app-container.dark-mode .toggle-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

/* === 统计页面样式 === */
.stats-container {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  max-width: 900px;
  margin: 0 auto;
}

.app-container.dark-mode .stats-container {
  background: #1e293b;
  color: #e2e8f0;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 25px;
  border-radius: 12px;
  text-align: center;
  color: white;
  box-shadow: 0 4px 12px rgba(102,126,234,0.3);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 1rem;
  opacity: 0.9;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.chart-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.app-container.dark-mode .chart-card {
  background: #334155;
}

.chart-card h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.2rem;
}

.app-container.dark-mode .chart-card h3 {
  color: #e2e8f0;
}

/* === 登录页面样式 === */
.login-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.app-container.dark-mode .login-page {
  background: transparent;
}

.login-container {
  display: flex;
  width: 90%;
  max-width: 900px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  overflow: hidden;
  animation: slideUp 0.5s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.app-container.dark-mode .login-container {
  background: #1e293b;
}

.login-left {
  flex: 1;
  padding: 50px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.login-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
}

.decoration-1 {
  width: 200px;
  height: 200px;
  top: -50px;
  right: -50px;
}

.decoration-2 {
  width: 150px;
  height: 150px;
  bottom: -30px;
  left: -30px;
}

.decoration-3 {
  width: 100px;
  height: 100px;
  top: 40%;
  left: 30%;
}

.login-welcome {
  text-align: center;
  color: white;
  z-index: 1;
}

.login-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.login-welcome h2 {
  font-size: 2rem;
  margin-bottom: 10px;
  font-weight: 700;
}

.login-welcome p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.login-right {
  flex: 1;
  padding: 50px 40px;
  position: relative;
}

.login-box {
  max-width: 400px;
  margin: 0 auto;
}

.close-login-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0,0,0,0.05);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
}

.app-container.dark-mode .close-login-btn {
  background: rgba(255,255,255,0.1);
  color: #e2e8f0;
}

.close-login-btn:hover {
  background: rgba(102,126,234,0.1);
  color: #667eea;
  transform: rotate(90deg);
}

.auth-tabs {
  display: flex;
  margin-bottom: 30px;
  border-bottom: 2px solid #eee;
}

.app-container.dark-mode .auth-tabs {
  border-bottom-color: #334155;
}

.auth-tab {
  flex: 1;
  padding: 12px;
  background: transparent;
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  color: #999;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
}

.app-container.dark-mode .auth-tab {
  color: #94a3b8;
}

.auth-tab:hover {
  color: #667eea;
}

.auth-tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.auth-form {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
}

.input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0 15px;
  transition: all 0.3s ease;
  background: #fafafa;
}

.app-container.dark-mode .input-wrapper {
  border-color: #334155;
  background: #1e293b;
}

.input-wrapper:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102,126,234,0.1);
  background: #ffffff;
}

.app-container.dark-mode .input-wrapper:focus-within {
  background: #0f172a;
}

.input-icon {
  font-size: 1.2rem;
  margin-right: 10px;
  opacity: 0.6;
}

.input-wrapper .form-input {
  border: none;
  background: transparent;
  padding: 14px 0;
  flex: 1;
  font-size: 1rem;
}

.app-container.dark-mode .input-wrapper .form-input {
  color: #e2e8f0;
}

.input-wrapper .form-input:focus {
  box-shadow: none;
  outline: none;
}

.auth-error {
  background: rgba(255,107,107,0.1);
  color: #ff6b6b;
  padding: 12px 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.95rem;
  border-left: 4px solid #ff6b6b;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: slideIn 0.3s ease;
}

.auth-error.shake {
  animation: shake 0.5s ease;
}

.error-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

/* 字段级别错误样式 */
.form-group.has-error .input-wrapper {
  border-color: #ff6b6b;
  background: rgba(255,107,107,0.05);
}

.form-group.has-error .input-wrapper:focus-within {
  border-color: #ff6b6b;
  box-shadow: 0 0 0 2px rgba(255,107,107,0.2);
}

.input-error {
  color: #ff6b6b;
}

.field-error {
  display: block;
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-top: 6px;
  margin-left: 5px;
  animation: fadeIn 0.3s ease;
}

/* 加载动画 */
.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.auth-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.auth-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102,126,234,0.4);
}

.auth-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  margin-top: 25px;
  color: #666;
}

.app-container.dark-mode .auth-footer {
  color: #94a3b8;
}

.auth-footer a {
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  margin-left: 5px;
}

.auth-footer a:hover {
  text-decoration: underline;
}

/* === 记住密码复选框样式 === */
.remember-me-wrapper {
  margin-bottom: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  cursor: pointer;
  accent-color: #667eea;
}

.checkbox-text {
  font-size: 0.95rem;
  color: #666;
}

.app-container.dark-mode .checkbox-text {
  color: #94a3b8;
}

/* === 验证码样式 === */
.captcha-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
}

.captcha-input-wrapper {
  flex: 1;
}

.captcha-canvas {
  width: 120px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.captcha-canvas:hover {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.app-container.dark-mode .captcha-canvas {
  border-color: #334155;
}

/* === 密码强度指示器样式 === */
.password-strength {
  margin-top: 10px;
  padding: 10px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
}

.strength-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.app-container.dark-mode .strength-bar {
  background: #334155;
}

.strength-fill {
  height: 100%;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.strength-label {
  font-size: 0.9rem;
  font-weight: 600;
  display: block;
  margin-bottom: 8px;
}

.strength-tips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.8rem;
}

.strength-tips span {
  color: #999;
  transition: all 0.3s ease;
}

.strength-tips span.met {
  color: #6bcf7f;
  font-weight: 600;
}

.app-container.dark-mode .strength-tips span {
  color: #64748b;
}

.app-container.dark-mode .strength-tips span.met {
  color: #6bcf7f;
}

/* === Toast 提示样式 === */
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(-100px);
  background: white;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 9999;
  opacity: 0;
  transition: all 0.3s ease;
  min-width: 200px;
  justify-content: center;
}

.toast.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

.toast-success {
  background: linear-gradient(135deg, #6bcf7f, #4ecdc4);
  color: white;
}

.toast-error {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: white;
}

.toast-warning {
  background: linear-gradient(135deg, #ffd93d, #ff9a9e);
  color: #333;
}

.toast-info {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.toast-icon {
  font-size: 1.2rem;
}

.toast-message {
  font-size: 0.95rem;
  font-weight: 500;
}

/* === 移动端响应式优化 === */
@media (max-width: 768px) {
  /* 登录页面移动端适配 */
  .login-container {
    flex-direction: column;
    width: 95%;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .login-left {
    padding: 30px 20px;
  }
  
  .login-icon {
    font-size: 3rem;
  }
  
  .login-welcome h2 {
    font-size: 1.5rem;
  }
  
  .login-welcome p {
    font-size: 0.95rem;
  }
  
  .login-right {
    padding: 30px 20px;
  }
  
  .auth-tab {
    font-size: 1rem;
    padding: 10px;
  }
  
  .decoration-1 {
    width: 120px;
    height: 120px;
    top: -30px;
    right: -30px;
  }
  
  .decoration-2 {
    width: 100px;
    height: 100px;
    bottom: -20px;
    left: -20px;
  }
  
  .decoration-3 {
    width: 60px;
    height: 60px;
  }
  
  .app-container {
    padding: 10px;
  }
  
  .header-banner {
    padding: 20px 0;
  }
  
  .header-top {
    flex-direction: column;
    gap: 10px;
  }
  
  .title {
    font-size: 1.8rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .header-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .theme-toggle {
    font-size: 0.8rem;
    padding: 6px 12px;
  }
  
  .tabs {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .tab-btn {
    padding: 10px 18px;
    font-size: 0.9rem;
  }
  
  .form-container {
    padding: 20px;
  }
  
  .section-title {
    font-size: 1.3rem;
  }
  
  .type-buttons {
    flex-wrap: wrap;
  }
  
  .type-btn {
    flex: 1;
    min-width: calc(50% - 6px);
    font-size: 0.9rem;
    padding: 12px;
  }
  
  .result-header {
    flex-direction: column;
    gap: 12px;
    padding: 20px 20px 10px 20px;
  }
  
  .result-actions {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-card {
    padding: 15px;
  }
  
  .chart-card h3 {
    font-size: 1rem;
  }
  
  .history-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .history-actions-group {
    flex-wrap: wrap;
    width: 100%;
  }
  
  .search-filter-container {
    flex-direction: column;
  }
  
  .search-input,
  .filter-select {
    width: 100%;
  }
  
  .history-item {
    flex-direction: column;
    gap: 10px;
    text-align: left;
  }
  
  .history-info {
    width: 100%;
  }
  
  .history-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .modal-buttons {
    flex-direction: column;
  }
  
  .tab-content {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .app-container {
    padding: 8px;
  }
  
  .header-banner {
    padding: 15px 0;
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  .tab-btn {
    padding: 8px 14px;
    font-size: 0.85rem;
  }
  
  .form-container,
  .result-container {
    padding: 15px;
  }
  
  .stat-value {
    font-size: 2rem;
  }
  
  .type-btn {
    min-width: 100%;
    font-size: 0.85rem;
  }
}

/* === 页面过渡动画 === */
/* 向左滑动 */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 向右滑动 */
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* === 骨架屏样式 === */
.skeleton-container {
  padding: 20px;
  animation: skeleton-fade-in 0.3s ease;
}

@keyframes skeleton-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.skeleton-fortune,
.skeleton-history,
.skeleton-favorites,
.skeleton-stats {
  max-width: 800px;
  margin: 0 auto;
}

/* 骨架屏基础元素 */
.skeleton-title,
.skeleton-subtitle,
.skeleton-input,
.skeleton-button,
.skeleton-avatar,
.skeleton-icon,
.skeleton-line,
.skeleton-card,
.skeleton-chart {
  background: linear-gradient(90deg, #e5e7eb 25%, #f0f0f0 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 8px;
}

.app-container.dark-mode .skeleton-title,
.app-container.dark-mode .skeleton-subtitle,
.app-container.dark-mode .skeleton-input,
.app-container.dark-mode .skeleton-button,
.app-container.dark-mode .skeleton-avatar,
.app-container.dark-mode .skeleton-icon,
.app-container.dark-mode .skeleton-line,
.app-container.dark-mode .skeleton-card,
.app-container.dark-mode .skeleton-chart {
  background: linear-gradient(90deg, #334155 25%, #475569 50%, #334155 75%);
  background-size: 200% 100%;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 算命页面骨架屏 */
.skeleton-header {
  text-align: center;
  margin-bottom: 30px;
}

.skeleton-title {
  width: 200px;
  height: 32px;
  margin: 0 auto 15px;
  border-radius: 16px;
}

.skeleton-subtitle {
  width: 150px;
  height: 20px;
  margin: 0 auto;
  border-radius: 10px;
}

.skeleton-form {
  background: rgba(255, 255, 255, 0.9);
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.app-container.dark-mode .skeleton-form {
  background: rgba(30, 41, 59, 0.9);
}

.skeleton-input {
  width: 100%;
  height: 50px;
  margin-bottom: 20px;
  border-radius: 10px;
}

.skeleton-button {
  width: 100%;
  height: 50px;
  border-radius: 12px;
  margin-top: 10px;
}

/* 历史记录和收藏骨架屏 */
.skeleton-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.app-container.dark-mode .skeleton-item {
  background: rgba(30, 41, 59, 0.8);
}

.skeleton-avatar,
.skeleton-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
  flex-shrink: 0;
}

.skeleton-content {
  flex: 1;
}

.skeleton-line {
  width: 100%;
  height: 16px;
  margin-bottom: 8px;
  border-radius: 8px;
}

.skeleton-line.short {
  width: 60%;
}

/* 统计页面骨架屏 */
.skeleton-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.skeleton-card {
  height: 120px;
  border-radius: 16px;
}

.skeleton-chart {
  width: 100%;
  height: 300px;
  border-radius: 16px;
}

/* 骨架屏过渡动画 */
.skeleton-enter-active,
.skeleton-leave-active {
  transition: opacity 0.3s ease;
}

.skeleton-enter-from,
.skeleton-leave-to {
  opacity: 0;
}

/* 深色模式自动切换提示 */
.theme-auto-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(102, 126, 234, 0.9);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 0.9rem;
  z-index: 1000;
  animation: slide-up 0.3s ease;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
