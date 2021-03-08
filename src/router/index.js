import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '首页', icon: 'dashboard' }
    }]
  },

  // {
  //   path: '/unit-management',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       name: 'UnitManagement',
  //       component: () => import('@/views/unit-management/index'),
  //       meta: { title: '单位管理', icon: 'form' }
  //     }
  //   ]
  // },

  // {
  //   path: '/user-management',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       name: 'UserManagement',
  //       component: () => import('@/views/user-management/index'),
  //       meta: { title: '用户管理', icon: 'form' }
  //     }
  //   ]
  // },

  {
    path: '/device-management',
    component: Layout,
    redirect: '/device-management/product-list',
    name: 'DeviceManagement',
    meta: {
      title: '产品列表',
    },
    children: [
      {
        path: 'product-list',
        name: 'ProductList',
        component: () => import('@/views/device-management/product-list'),
        meta: { title: '产品列表', icon: 'form' },
      },
      {
        path: 'device-list/:productKey',
        name: 'DeviceList',
        hidden: true,
        component: () => import('@/views/device-management/device-list'),
        meta: { title: '设备管理', icon: 'form' },
      },
    ]
  },

  {
    path: '/building-management',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'BuildingManagement',
        component: () => import('@/views/building-management/index'),
        meta: { title: '楼宇管理', icon: 'form' }
      }
    ]
  },

  {
    path: '/model-management',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'ModelManagement',
        component: () => import('@/views/model-management/index'),
        meta: { title: '模型管理', icon: 'form' }
      }
    ]
  }

  // 404 page must be placed at the end !!!
  // { path: '*', redirect: '/404', hidden: true }
]

export const asyncRoutes = [
  {
    path: '/unit-management',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'UnitManagement',
        component: () => import('@/views/unit-management/index'),
        meta: { title: '单位管理', icon: 'form', roles: ['admin'] }
      }
    ]
  },
  {
    path: '/user-management',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'UserManagement',
        component: () => import('@/views/user-management/index'),
        meta: { title: '用户管理', icon: 'form', roles: ['admin'] }
      }
    ]
  },

  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
