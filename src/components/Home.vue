<template>
    <el-container class="home-container">
        <!--        头部区域-->
        <el-header>
            <div>
                <img src="../assets/heima.png" alt="">
                <span>后台管理系统</span>
            </div>
            <el-button type="info" @click="logOut">退出</el-button>
        </el-header>
        <!--页面主体区域-->
        <el-container>
            <!--左侧边栏-->
            <el-aside :width="isCollapse ? '64px' : '200px'">
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <!--侧边栏菜单区域-->
                <el-menu background-color="#333744" text-color="#fff" active-text-color="#409BFF" :unique-opened="true"
                         :collapse="isCollapse" :collapse-transition="false" :router="true"
                         :default-active="activePath">
                    <!--一级菜单-->
                    <el-submenu :index="item.id+ ''" v-for="item in menuList" :key="item.id">
                        <!--一级菜单模板区域-->
                        <template slot="title">
                            <!-- 图标-->
                            <i :class="iconsObj[item.id]"></i>
                            <!--文本-->
                            <span>{{item.authName}}</span>
                        </template>
                        <!--二级菜单-->
                        <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children"
                                      :key="subItem.id" @click="saveNavState('/' + subItem.path)">
                            <template slot="title">
                                <!-- 图标-->
                                <i class="el-icon-menu"></i>
                                <!--文本-->
                                <span>{{subItem.authName}}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!--            右侧内容主体区域-->
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
  data () {
    return {
      menuList: [],
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollapse: false,
      // 被激活的链接地址
      activePath: ''
    }
  },
  // 访问后台之前，先将菜单接口数据渲染出来
  created () {
    this.getMenuList()
    // 刷新页面后，从session中获取激活的链接
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logOut () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有菜单
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    },
    // 折叠菜单
    toggleCollapse () {
      // 取反
      this.isCollapse = !this.isCollapse
    },
    // 解决刷新后，菜单无法高亮选中
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
    .home-container {
        height: 100%;
    }

    .el-header {
        background-color: #373d41;
        display: flex;
        justify-content: space-between;
        padding-left: 0;
        align-items: center;
        color: #fff;
        font-size: 20px;

        div {
            display: flex;
            align-items: center;

            span {
                margin-left: 15px;
            }
        }
    }

    .el-aside {
        background-color: #333744;

        .el-menu {
            border-right: 0;
        }

    }

    .el-main {
        background-color: #EAEDF1;
    }

    .iconfont {
        margin-right: 10px;
    }

    .toggle-button {
        background-color: #4A5064;
        font-size: 10px;
        line-height: 24px;
        color: #fff;
        text-align: center;
        letter-spacing: 0.2em;
        cursor: pointer;
    }

</style>
