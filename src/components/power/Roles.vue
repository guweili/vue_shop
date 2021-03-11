<template>
    <div>
        <!--面包屑导航区-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片视图-->
        <el-card>
            <!--添加角色按钮区-->
            <el-row>
                <el-col>
                    <el-button type="primary">添加角色</el-button>
                </el-col>
            </el-row>
            <!--角色列表区-->
            <el-table :data="roleList" border stripe>
                <!--展开列-->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom', i1 ===0 ? 'bdtop': '', 'vcenter']"
                                v-for="(item1, i1) in scope.row.children"
                                :key="item1.id">
                            <!--一级权限-->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}
                                </el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!--二三级权限-->
                            <el-col :span="19">
                                <!--通过for循环嵌套渲染二级权限-->
                                <el-row :class="[i2 !==0 ? 'bdtop': '', 'vcenter']"
                                        v-for="(item2, i2) in item1.children"
                                        :key="item2.id">
                                    <el-col :span="5">
                                        <el-tag closable type="success" @close="removeRightById(scope.row, item2.id)">
                                            {{item2.authName}}
                                        </el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="19">
                                        <!--三级级权限-->
                                        <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable
                                                @close="removeRightById(scope.row, item3.id)">
                                            {{item3.authName}}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!--索引列-->
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                        <el-button size="mini" type="warning" icon="el-icon-setting"
                                   @click="showSetRightDialog(scope.row)">分配权限
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!--分配权限对话框-->
        <el-dialog title="分配权限" :visible.sync="setDialogVisible" width="30%" @close="setRightDialogClosed">
            <el-tree
                    :data="rightsList"
                    show-checkbox
                    default-expand-all
                    :default-checked-keys="defKeys"
                    node-key="id"
                    ref="treeRef"
                    :props="treeProps">
            </el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有列表数据
      roleList: [],
      // 分配权限的对话框状态
      setDialogVisible: false,
      // 所有权限的数据
      rightsList: [],
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 权限id列表
      defKeys: [],
      // 修改的当前角色权限的id
      roleId: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.roleList = res.data
    },
    // 根据id删除权限
    async removeRightById (role, rightsId) {
      // 弹框提示用户是否删除
      // 弹窗询问用户是否删除数据
      const confirmResult = await this.$confirm('此操作将删除角色权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      // 如果用户确认删除，测返回字符串confirm
      // 如果用户取消了杀出, 则返回值为字符串cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      // 请求删除地址
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightsId}`)
      if (res.meta.status !== 200) return this.$message.error('权限删除失败')
      this.$message.success('删除成功')

      // 防止页面从新加载，影响用户体验,局部更新角色权限操作
      // this.getRolesList()
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      // 保存id，提交修改权限时需要
      this.roleId = role.id
      // 获取所有权限数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
      this.rightsList = res.data

      // 获取三级节点的id
      this.getLeafKeys(role, this.defKeys)

      this.setDialogVisible = true
    },
    // 递归循环获取三级权限id, 保存到数组中
    getLeafKeys (node, arr) {
      // 如果当前node节点不包含children属性,则为三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 监听权限对话框关闭事件, 清空defKeys
    setRightDialogClosed () {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights () {
      // 获取选中节点的id
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })

      if (res.meta.status !== 200) return this.$message.error('权限修改失败')

      this.$message.success('修改成功')
      this.setDialogVisible = false
      this.getRolesList()
    }
  }
}
</script>

<style lang="less" scoped>
    .el-tag {
        margin: 7px;
    }

    .bdtop {
        border-top: 1px solid #eee;
    }

    .bdbottom {
        border-bottom: 1px solid #eee;
    }

    .vcenter {
        display: flex;
        align-items: center;
    }
</style>
