import Vue from 'vue'
import VueRouter from 'vue-router'
import { getCookie, setCookie } from '../common/js/cookie'

Vue.use(VueRouter)

const routes = [
  {
    path: "/",
    redirect: '/index/home'
  },
  {
    path: '/login',
    name: '登陆',
    component: () => import('views/login/login'),
    meta: {
      showBar: false
    }
  },
  {
    path: '/mallregister',
    name: '注册',
    component: () => import('views/mallregister/mallregister'),
    meta: {
      showBar: false
    }
  },
  {
    path: '/index',
    name: '首页',
    component: () => import('views/index/index'),
    children: [
      {
        path: '/index/home',
        name: '首页',
        component: () => import('views/home/home'),
      },
      {
        path: '/system/deptManager',
        name: '部门管理',
        meta: {
          name: '系统管理'
        },
        component: () => import('views/system/deptManager'),
      },
      {
        path: '/system/role',
        name: '角色管理',
        component: () => import('views/system/role'),
      },
      {
        path: '/system/user',
        name: '用户管理',
        component: () => import('views/system/user'),
      },
      {
        path: '/system/system',
        name: '系统设置',
        component: () => import('views/system/system'),
      },
      {
        path: '/system/screensaver',
        name: '屏保管理',
        component: () => import('views/system/screensaver'),
      },
      {
        path: '/system/log',
        name: '日志查询',
        component: () => import('views/system/log'),
      },
      {
        path: '/system/password',
        name: '密码配置',
        component: () => import('views/system/password'),
      },
      {
        path: '/system/deptConfig',
        name: '开放秘钥',
        component: () => import('views/system/deptConfig'),
      },
      {
        path: '/system/notice',
        name: '通知中心',
        component: () => import('views/system/notice'),
      },
      {
        path: '/system/personal',
        name: '个人中心',
        component: () => import('views/system/personal'),
      },
      {
        path: '/device/device',
        name: '终端设备列表',
        component: () => import('views/device/device'),
      },
      {
        path: '/device/device-details',
        name: '设备详情',
        component: () => import('views/device/device-details'),
      },
      {
        path: '/device/device-group',
        name: '设备组管理',
        component: () => import('views/device/device-group'),
      },
      {
        path: '/app/app-list',
        name: '我的应用',
        component: () => import('views/app/app-list'),
      },
      {
        path: '/app/app-time',
        name: '应用时间轴',
        component: () => import('views/app/app-time'),
      },
      {
        path: '/mall/building',
        name: '楼栋管理',
        component: () => import('views/mall/building'),
      },
      {
        path: '/mall/region',
        name: '区域管理',
        component: () => import('views/mall/region'),
      },
      {
        path: '/mall/floor',
        name: '楼层管理',
        component: () => import('views/mall/floor'),
      },
      {
        path: '/mall/format',
        name: '业态管理',
        component: () => import('views/mall/format'),
      },
      {
        path: '/mall/shop',
        name: '品牌数据',
        component: () => import('views/mall/shop'),
      },
      {
        path: '/mall/office',
        name: '写字楼数据',
        component: () => import('views/mall/office'),
      },
      {
        path: '/mall/map',
        name: '地图编辑器',
        component: () => import('views/mall/map'),
      },
      {
        path: '/statistics/newest-statistics',
        name: '素材上新',
        component: () => import('views/statistics/newest-statistics'),
      },
      {
        path: '/statistics/program-statistics',
        name: '节目播放',
        component: () => import('views/statistics/program-statistics'),
      },
      {
        path: '/program/material',
        name: '素材管理',
        component: () => import('views/program/material'),
      },
      {
        path: '/audit/material',
        name: '素材审核',
        component: () => import('views/audit/material'),
      },
      {
        path: '/program/programs',
        name: '节目制作',
        component: () => import('views/program/programs'),
      },
      {
        path: '/program/schedule',
        name: '日程管理',
        component: () => import('views/program/schedule'),
      },
      {
        path: '/audit/schedule',
        name: '素材审核',
        component: () => import('views/audit/schedule'),
      },
      {
        path: '/program/published-schedules',
        name: '发布列表',
        component: () => import('views/program/published-schedules'),
      },

    ]
  },
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if ((to.path === '/login' && !getCookie('autoauth')) || to.path === '/mallregister') {
    next()
  } else {
    if (getCookie('autoauth')) {
      let userInfo = decodeURIComponent(getCookie('userInfo'))
      setCookie(userInfo, 'userInfo', 1)
      next()
      return
    }
    let userInfo = JSON.parse(getCookie('userInfo'))
    if (userInfo.userCode) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
