<template>
    <div>
        <!--面包屑导航区-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片视图-->
        <el-card>
            <!--添加角色按钮区-->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!--表格-->
            <tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type="false"
                        :expand-type="false"
                        :show-index="true" index-text="#" border>
                <!--是否有效-->
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted ===false" style="color: green"></i>
                    <i class="el-icon-error" v-else style="color: red"></i>
                </template>
                <!--排序-->
                <template slot="order" slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.cat_level ===0">一级</el-tag>
                    <el-tag size="mini" type="success" v-else-if="scope.row.cat_level ===1">二级</el-tag>
                    <el-tag size="mini" type="warning" v-else>三级</el-tag>
                </template>
                <!--操作-->
                <template slot="opt" slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini"
                               @click="showEditCateDialog(scope.row.cat_id)">
                        编辑
                    </el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini"
                               @click="removedCateById(scope.row.cat_id)">
                        删除
                    </el-button>
                </template>
            </tree-table>
            <!--分页-->
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="queryInfo.pagenum"
                    :page-sizes="[1, 2, 3, 5, 10]"
                    :page-size="queryInfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </el-card>
        <!--添加分类对话框-->
        <el-dialog
                title="添加分类"
                :visible.sync="addCateDialogVisible"
                width="30%"
                @close="addCateDialogClosed">
            <!--添加分类表单-->
            <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
                <el-form-item label="分类名称:" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级名称:">
                    <el-cascader
                            expand-trigger="hover"
                            v-model="selectedKeys"
                            :options="parentCateList"
                            :props="cascaderProps"
                            clearable
                            change-on-select
                            @change="parentCateChange">
                        <template slot-scope="{ node, data }">
                            <span>{{ data.cat_name }}</span>
                            <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
                        </template>
                    </el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
        <!--修改分类对话框-->
        <el-dialog
                title="添加分类"
                :visible.sync="editCateDialogVisible"
                width="30%"
                @close="editCateDialogClosed">
            <!--分类名称-->
            <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="100px">
                <el-form-item label="分类名称:" prop="cat_name">
                    <el-input v-model="editCateForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editCateName">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类默认的首次查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类数据列表
      cateList: [],
      // 总个数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示当前列字定义为模板列
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          // 表示当前列字定义为模板列
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          // 表示当前列字定义为模板列
          type: 'template',
          template: 'opt'
        }
      ],
      // 控制添加分类对话框,显示与隐藏
      addCateDialogVisible: false,
      // 添加分类表单的数据对象
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类id
        cat_pid: 0,
        // 分类等级，默认添加是一级分类
        cat_level: 0
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      },
      // 父级分类列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 控制修改分类对话框
      editCateDialogVisible: false,
      // 分类详情
      editCateForm: {},
      // 添加分类名称
      editCateFormRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')

      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pagenum 改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 显示添加分类对话框
    showAddCateDialog () {
      // 先获取父级分类数据列表，然后在渲染对话框
      this.getParentCateList()
      // 再打开对话框
      this.addCateDialogVisible = true
    },
    // 监听对话框的关闭事件，重置数据
    addCateDialogClosed () {
      // 重置父类id列表
      this.selectedKeys = []
      // 重置
      this.addCateForm = {
        // 重置分类名称
        cat_name: '',
        // 重置父级分类id
        cat_pid: 0,
        // 重置分类等级，默认添加是一级分类
        cat_level: 0
      }
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类数据失败')
      this.parentCateList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCateChange () {
      // 如果selectedKeys 数组中length大于0，证明选中的父级分裂
      // 繁殖，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 问当前分类的等级赋值
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 监听对话框的关闭事件，重置表单数据
    addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        this.$message.success('添加成功')
        // 重置数据
        this.addCateDialogVisible = false
        this.addCateDialogClosed()
        this.getCateList()
      })
    },
    // 显示编辑分类对话框
    async showEditCateDialog (id) {
      // 先获取点击的分类id
      const { data: res } = await this.$http.get(`categories/${id}`)
      // 请求获取分类详情
      if (res.meta.status !== 200) return this.$message.error('获取分类详情失败')
      this.editCateForm = res.data
      // 再打开对话框
      this.editCateDialogVisible = true
    },
    // 编辑商品分类名称
    async editCateName () {
      // 获取id，进行修改后的提交操作
      const { data: res } = await this.$http.put(`categories/${this.editCateForm.cat_id}`, { cat_name: this.editCateForm.cat_name })
      if (res.meta.status !== 200) return this.$message.error('修改失败')
      this.$message.success('更新成功')
      // 修改完成关闭对话框
      this.editCateDialogVisible = false
      // 重新拉取数据
      this.getCateList()
    },
    // 监听对话框的关闭事件，重置数据
    editCateDialogClosed () {
      this.editCateForm = {}
    },
    async removedCateById (id) {
      // 弹窗询问用户是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      // 如果用户确认删除，测返回字符串confirm
      // 如果用户取消了删除, 则返回值为字符串cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`categories/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
    .treeTable {
        margin-top: 10px;
    }

    .el-cascader {
        width: 100%;
    }
</style>
