<template>
    <div class="login_container">
        <div class="login_box">
            <!--      头像区域-->
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <!--      表单区域-->
            <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form">
                <!--        用户名-->
                <el-form-item prop="username">
                    <el-input prefix-icon="iconfont icon-user" v-model="loginForm.username"></el-input>
                </el-form-item>
                <!--        密码-->
                <el-form-item prop="password">
                    <el-input prefix-icon="iconfont icon-3702mima" v-model="loginForm.password"
                              type="password"></el-input>
                </el-form-item>
                <!--        按钮-->
                <el-form-item class="btns">
                    <el-button type="primary" @click="login" :plain="true">登陆</el-button>
                    <el-button type="info" @click="resetLoginForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 这是登陆表单的数据绑定对象
      loginForm: {
        username: '',
        password: ''
      },
      // 这是表单的 验证规则对象
      loginFormRules: {
        // 用户名是否合法
        username: [
          // required 必填项目  message提示信息  trigger输入框失去焦点
          {
            required: true,
            message: '请输入登陆名称',
            trigger: 'blur'
          },
          // 长度判断
          {
            min: 3,
            max: 10,
            message: '长度在3到10个字符',
            trigger: 'blur'
          }
        ],
        // 密码是否合法
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 15,
            message: '长度在6到15个字符',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    // 重置按钮重置登陆表单
    resetLoginForm () {
      // console.log(this)
      // ref="loginFormRef" 表单对象的 resetFields 属性会清空表单的所有内容
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      // 表单提交预验证 valid 返回 bool值
      // 通过 axios 模块创建的 $http 属性，是一个 promise对象， 可以通过 async 异步, 返回一个具体的响应对象
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return
        // const result = await this.$http.post('login', this.loginForm)
        // 通过 { data: res } 此方法，ajax请求后的结果进行解构，获得data属性值
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        // 1.将登陆成功之后的token，保存到客户端的sessionStorage中
        // 1.1 项目中出了登陆之外的其他api接口，必须在登陆之后才能访问
        // 1.2 token 只因在当前的网站打开期间生效，所以将token保存在sessionStorage中
        window.sessionStorage.setItem('token', res.data.token)
        // 2. 通过编程式导航跳转到后台主页，路由地址是 /home
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
    .login_container {
        background-color: #2b4b6b;
        height: 100%;
    }

    .login_box {
        width: 450px;
        height: 300px;
        background-color: #fff;
        border-radius: 3px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    .avatar_box {
        height: 130px;
        width: 130px;
        border: 1px solid #eee;
        border-radius: 50%;
        padding: 10px;
        box-shadow: 0 0 10px #ddd;
        position: absolute;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #fff;

        img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #eee;
        }
    }

    .login_form {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 10px;
        box-sizing: border-box;
    }

    .btns {
        display: flex;
        justify-content: flex-end;
    }
</style>
