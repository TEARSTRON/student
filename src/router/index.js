import Vue from 'vue'
import Router from 'vue-router'

// 组件导入
import HomePage from '@/pages/home.vue'; // 引入Home组件  路由

// 使用 Router 插件
Vue.use(Router) 

// 创建路由实例
export default new Router({
  mode: 'history', // 使用 HTML5 History 模式
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/home',
      name: 'HomePage',
      component: HomePage
    },
  ]
})
