import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'

import ZkTale from 'vue-table-with-tree-grid'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

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
// 将富文本编辑器注册为全局可用
Vue.use(VueQuillEditor)

Vue.config.productionTip = false

Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '')
  const mm = (dt.getMinutes() + '').padStart(2, '')
  const ss = (dt.getSeconds() + '').padStart(2, '')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
