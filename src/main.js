import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'

import ZkTale from 'vue-table-with-tree-grid'

import axios from 'axios'
// 通过axios模块发送ajax请求, 设置默认根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 请求预处理携带token
axios.interceptors.request.use(config => {
  // 使每个请求都携带token  验证字段Authorization
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

Vue.prototype.$http = axios
Vue.component('tree-table', ZkTale)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
