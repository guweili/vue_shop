<template>
    <div>
        <!--面包屑导航区-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片视图区-->
        <el-card>
            <!--提示区-->
            <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
            <!--步骤条-->
            <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>

            <!--form表单-->
            <el-form ref="addFormRef" :rules="addFormRules" :model="addForm" label-width="100px" label-position="top">
                <!--tab栏区域-->
                <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave"
                         @tab-click="tabClicked">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader
                                    expand-trigger="hover"
                                    v-model="addForm.goods_cat"
                                    clearable
                                    :props="cateProps"
                                    :options="cateList"
                                    @change="handleChange">
                            </el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <!--渲染表单label的基本项-->
                        <el-form-item :label="item.attr_name" :key="item.attr_id" v-for="item in manyTableData">
                            <!--渲染表单标签的基本项-->
                            <el-checkbox-group v-model="item.attr_vals" @change="handleCheckedCitiesChang">
                                <el-checkbox border :key="i" :label="attr"
                                             v-for="(attr,i) in item.attr_vals">
                                </el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <el-upload
                                :action="uploadUrl"
                                :on-preview="handlePreview"
                                :on-remove="handleRemove"
                                :on-success="handleSuccess"
                                :file-list="fileList"
                                :headers="headerObj"
                                list-type="picture">
                            <el-button size="small" type="primary">点击上传</el-button>
                            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <!--富文本编辑器组件-->
                        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                        <!--添加商品的按钮-->
                        <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>

            <!--图片预览对话框-->
            <el-dialog
                    title="图片预览"
                    :visible.sync="previewVisible">
                <img :src="previewPath" class="previewImg">
                <span slot="footer" class="dialog-footer">
                    <el-button @click="dialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
                </span>
            </el-dialog>
        </el-card>

    </div>
</template>

<script>
import { getCateList } from '../../utils/utils'
import _ from 'lodash'

export default {
  data () {
    return {
      activeIndex: '0',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        attrs: []
      },
      // 表单预处理规则
      addFormRules: {
        goods_name: [
          {
            required: true,
            message: '请输入商品名称',
            trigger: 'blur'
          }
        ],
        goods_price: [
          {
            required: true,
            message: '请输入商品价格',
            trigger: 'blur'
          }
        ],
        goods_weight: [
          {
            required: true,
            message: '请输入商品重量',
            trigger: 'blur'
          }
        ],
        goods_number: [
          {
            required: true,
            message: '请输入商品数量',
            trigger: 'blur'
          }
        ],
        goods_cat: [
          {
            required: true,
            message: '请选择商品分类',
            trigger: 'blur'
          }
        ]
      },
      // 商品分类列表
      cateList: [],
      // 级联选择框 value为选中的值， label为显示在页面中的值， 循环的后续子级联框
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 商品参数
      manyTableData: [],
      // 商品属性
      onlyTableData: [],
      // 文件列表
      fileList: [],
      // 图片上传地址
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 设置上传图片的请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 显示预览图对话框
      previewVisible: false,
      // 预览图片路劲
      previewPath: ''
    }
  },
  async created () {
    this.cateList = await getCateList(this.$http.get, this.$message)
  },
  methods: {
    // 级联选择框选中项变化，触发此函数
    handleChange () {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        return this.$message.error('请选择三级分类')
      }
    },
    // tab切换时触发函数 , oldActiveName标签页， 进入的标签页activeName
    beforeTabLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    // 获取商品参数
    async tabClicked () {
      switch (this.activeIndex) {
        case '1':
          var { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
          if (res.meta.status !== 200) return this.$message.error('获取商品参数列表失败')
          this.$message.success('获取商品参数成功')
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
            // 控制文本框的显示与隐藏
            item.inputVisible = false
            // 文本框输入值
            item.inputValue = ''
          })
          this.manyTableData = res.data
          break
        case '2':
          var { data: res2 } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
          if (res2.meta.status !== 200) return this.$message.error('获取商品属性列表失败')
          this.$message.success('获取商品属性成功')
          this.onlyTableData = res2.data
          break
      }
    },
    // 复选框变动时
    handleCheckedCitiesChang (value) {
      console.log(value)
    },
    // 监听图片上传成功
    handleSuccess (response) {
      if (response.meta.status !== 200) return this.$message.error('图片上传失败')
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
      this.$message.success('图片上传成功')
    },
    // 图片预览预处理
    handlePreview (file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 图片移除预处理
    handleRemove (file, fileList) {
      // 获取需要移除图片的临时路劲
      const filePath = file.response.data.tmp_path
      // 数组调用 查询索引方法,获取对应的索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 删除指定图片的索引值
      this.addForm.pics.splice(i, 1)
      this.$message.success('移除成功')
    },
    // 添加商品
    add () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        // 将属性数组转化成对象，提交到后台
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        const { data: res } = await this.$http.post('/goods', form)
        if (res.meta.status !== 201) return this.$message.error('添加失败')
        this.$message.success('添加成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
    .el-checkbox {
        margin: 0 5px 0 0 !important;
    }

    .previewImg {
        width: 100%;
    }

    .btnAdd {
        margin-top: 15px;
    }
</style>
