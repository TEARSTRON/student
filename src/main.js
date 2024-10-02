import Vue from 'vue'
import App from './App.vue'
import router from './router';
import axios from 'axios'
import './mock/mock'; 

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

// 1. 使用 Vue.use 安装插件
Vue.use(ElementUI)

// 挂载axios
Vue.prototype.$axios = axios
// 3. 创建和挂载根实例
new Vue({
  router, // 使用路由
  render: h => h(App),
}).$mount('#app');


Vue.config.productionTip = false

