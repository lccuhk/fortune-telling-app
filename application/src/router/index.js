import { createRouter, createWebHistory } from 'vue-router'

const Home = () => import('../pages/Home.vue')
const HePan = () => import('../pages/HePan.vue')
const FortunePage = () => import('../pages/FortunePage.vue')
const BaziPage = () => import('../pages/BaziPage.vue')
const ZiweiPage = () => import('../pages/ZiweiPage.vue')
const ShengxiaoPage = () => import('../pages/ShengxiaoPage.vue')
const XingzuoPage = () => import('../pages/XingzuoPage.vue')
const XingmingPage = () => import('../pages/XingmingPage.vue')
const JiemengPage = () => import('../pages/JiemengPage.vue')
const TarotPage = () => import('../pages/TarotPage.vue')
const LoginPage = () => import('../pages/LoginPage.vue')
const HuangliPage = () => import('../pages/HuangliPage.vue')

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/fortune',
    name: 'Fortune',
    component: FortunePage,
    meta: {
      title: '传统算命',
      description: '基于生辰八字的传统命理分析'
    }
  },
  {
    path: '/bazi',
    name: 'Bazi',
    component: BaziPage,
    meta: {
      title: '八字算命',
      description: '基于天干地支的传统命理分析'
    }
  },
  {
    path: '/ziwei',
    name: 'Ziwei',
    component: ZiweiPage,
    meta: {
      title: '紫微斗数',
      description: '十四主星命盘分析'
    }
  },
  {
    path: '/shengxiao',
    name: 'Shengxiao',
    component: ShengxiaoPage,
    meta: {
      title: '生肖运势',
      description: '基于中国传统生肖的运势分析'
    }
  },
  {
    path: '/xingzuo',
    name: 'Xingzuo',
    component: XingzuoPage,
    meta: {
      title: '星座运势',
      description: '基于西方占星学的运势分析'
    }
  },
  {
    path: '/xingming',
    name: 'Xingming',
    component: XingmingPage,
    meta: {
      title: '姓名学',
      description: '基于姓名笔画和五格剖象法的命理分析'
    }
  },
  {
    path: '/jiemeng',
    name: 'Jiemeng',
    component: JiemengPage,
    meta: {
      title: '周公解梦',
      description: '解读梦境背后的含义'
    }
  },
  {
    path: '/tarot',
    name: 'Tarot',
    component: TarotPage,
    meta: {
      title: '塔罗牌占卜',
      description: '塔罗牌在线抽牌和解读'
    }
  },
  {
    path: '/hepan',
    name: 'HePan',
    component: HePan,
    meta: {
      title: '多人合盘',
      description: '分析两人的命理匹配度'
    }
  },
  {
    path: '/huangli',
    name: 'Huangli',
    component: HuangliPage,
    meta: {
      title: '黄历',
      description: '每日宜忌、时辰吉凶查询'
    }
  }
]

const router = createRouter({
  history: createWebHistory('/fortune-telling-app/'),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - 命运之轮`
  } else {
    document.title = '命运之轮 - 探索你的专属命运指引'
  }

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

  if (to.meta.requiresAuth !== false && !isLoggedIn && to.name !== 'Login') {
    next({ name: 'Login' })
    return
  }

  if (to.name === 'Login' && isLoggedIn) {
    next({ name: 'Home' })
    return
  }

  next()
})

export default router
