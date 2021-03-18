<template>
    <div>
        <!--面包屑导航区-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <!--头部警告区域-->
            <el-alert title="注意：只允许为第三级分类设置相关参数！" show-icon type="warning" :closable="false">
            </el-alert>
            <!--选择商品分类区域-->
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <!--选择商品分类的级联选择框-->
                    <el-cascader
                            expand-trigger="hover"
                            v-model="selectedCateKeys"
                            clearable
                            :props="cateProps"
                            :options="cateList"
                            @change="handleChange">
                    </el-cascader>
                </el-col>
            </el-row>
            <!--tab 页签区域-->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <!--添加动态参数的面板-->
                <el-tab-pane label="动态参数" name="many" :disabled="isBtnDisabled">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled"
                               @click="addDialogVisible = true">
                        添加参数
                    </el-button>
                    <!--动态表格-->
                    <el-table :data="manyTableData" border stripe>
                        <!--展开行-->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <!--循环渲染tag标签-->
                                <el-tag :key="i" v-for="(item,i) in scope.row.attr_vals" closable
                                        @close="tagHandleClose(scope.row, i)">
                                    {{item}}
                                </el-tag>
                                <!--输入文本框-->
                                <el-input
                                        class="input-new-tag"
                                        v-if="scope.row.inputVisible"
                                        v-model="scope.row.inputValue"
                                        ref="saveTagInput"
                                        size="small"
                                        @keyup.enter.native="handleInputConfirm(scope.row)"
                                        @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <!--添加按钮-->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+
                                    New Tag
                                </el-button>
                            </template>
                        </el-table-column>
                        <!--索引列-->
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini"
                                           @click="showEditDialog(scope.row.attr_id)">编辑
                                </el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini"
                                           @click="removedCateById(scope.row.attr_id)">删除
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <!--添加静态属性的面板-->
                <el-tab-pane label="静态属性" name="only" :disabled="isBtnDisabled">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled"
                               @click="addDialogVisible = true">
                        添加属性
                    </el-button>
                    <!--静态表格-->
                    <el-table :data="onlyTableData" border stripe>
                        <!--展开行-->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <!--循环渲染tag标签-->
                                <el-tag :key="i" v-for="(item,i) in scope.row.attr_vals" closable
                                        @close="tagHandleClose(scope.row, i)">
                                    {{item}}
                                </el-tag>
                                <!--输入文本框-->
                                <el-input
                                        class="input-new-tag"
                                        v-if="scope.row.inputVisible"
                                        v-model="scope.row.inputValue"
                                        ref="saveTagInput"
                                        size="small"
                                        @keyup.enter.native="handleInputConfirm(scope.row)"
                                        @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <!--添加按钮-->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+
                                    New Tag
                                </el-button>
                            </template>
                        </el-table-column>
                        <!--索引列-->
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini"
                                           @click="showEditDialog(scope.row.attr_id)">编辑
                                </el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini"
                                           @click="removedCateById(scope.row.attr_id)">删除
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!--添加对话框-->
        <el-dialog
                :title="'添加' + titleText"
                :visible.sync="addDialogVisible"
                width="50%"
                @close="addDialogClosed">
            <!--添加参数对话框-->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>

        <!--修改对话框-->
        <el-dialog
                :title="'修改' + titleText"
                :visible.sync="editDialogVisible"
                width="50%"
                @close="editDialogClosed">
            <!--修改参数对话框-->
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择框 value为选中的值， label为显示在页面中的值， 循环的后续子级联框
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定的数组
      selectedCateKeys: [],
      // tab标签默认选中的tab栏
      activeName: 'many',
      // 动态表格数据绑定
      manyTableData: [],
      // 静态表格数据绑定
      onlyTableData: [],
      // 控制添加对话框状态
      addDialogVisible: false,
      // 添加参数的表单数据
      addForm: {
        attr_name: ''
      },
      // 添加表单的验证规则
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      },
      // 控制修改对话框
      editDialogVisible: false,
      // 修改参数的表单数据
      editForm: {
        attr_name: ''
      },
      // 添加表单的验证规则
      editFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
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
    // 获取所有的商品分类
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('请求商品分类失败')
      this.cateList = res.data
    },
    // 级联选择框选中项变化，触发此函数
    handleChange () {
      this.activeName = 'many'
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return this.$message.error('请选择三级分类')
      }
      // 重新切换级联选择器时，从新发起请求
      this.getParamsData()
    },
    // tab 页签点击事件的处理函数
    handleTabClick () {
      // 切换tab页面时，发起请求
      this.getParamsData()
    },
    // 获取参数列表数据
    async getParamsData () {
      // 根据选择的id和当前选中的tab页面，发起请求
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes?sel=${this.activeName}`)
      if (res.meta.status !== 200) return this.$message.error('获取失败')

      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框输入值
        item.inputValue = ''
      })
      // 通过打开的页面，复制到对应的数据绑定中
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 监听对话框关闭事件
    addDialogClosed () {
      // 对话框关闭重置表单数据
      this.$refs.addFormRef.resetFields()
    },
    // 提交添加方法
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`/categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })

        if (res.meta.status !== 201) return this.$message.error('添加失败')
        this.$message.success('添加成功')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 监听对话框关闭事件
    editDialogClosed () {
      // 对话框关闭重置表单数据
      this.$refs.editFormRef.resetFields()
    },
    // 显示修改对话框，填充数据
    async showEditDialog (attrId) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('获取失败')

      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 修改方法提交
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`/categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })

        if (res.meta.status !== 200) return this.$message.error('修改失败')
        this.$message.success('修改成功')
        this.editDialogVisible = false
        this.getParamsData()
      })
    },
    // 删除
    async removedCateById (attrId) {
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
      const { data: res } = await this.$http.delete(`/categories/${this.cateId}/attributes/${attrId}`)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      this.getParamsData()
    },
    // 点击按钮，展示文本输入框
    showInput (row) {
      row.inputVisible = true
      // 点击按钮，获得输入框的焦点
      // $nextTick方法作用，就是当页面上元素被从新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 添加标签, 文本框失去焦点或回车键触发
    handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    // 删除对应的参数选项
    tagHandleClose (row, index) {
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
    },
    // 修改并保存标签
    async saveAttrVals (row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) return this.$message.error('修改失败')
      this.$message.success('修改成功')
    }
  },
  computed: {
    // 如果按钮需要被禁用，测返回true，否则反回false
    isBtnDisabled () {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类的id
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态计算标题的文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态参数'
    }
  }
}
</script>

<style lang="less" scoped>
    .cat_opt {
        margin: 15px 0;
    }

    .el-tag {
        margin: 5px;
    }

    .input-new-tag {
        width: 150px;
    }
</style>
