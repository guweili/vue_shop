import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)
// 表单组件
Vue.use(Form)
Vue.use(FormItem)
// 输入框组件
Vue.use(Input)
// 导入弹框提示组件
Vue.prototype.$message = Message
